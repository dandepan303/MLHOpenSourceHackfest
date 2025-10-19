import axios from "axios";
import { extractJson, getGeminiJsonResponse, getGeminiResponse } from "../dependency_helpers/AI";
import { braveSearch, googleSearch } from "../dependency_helpers/Search";
import { request } from "../util/api";
import { getRepoFile, getRepoMetadata, GitHubTree, parseRepoTree } from "../dependency_helpers/GithubHelpers";

// MAIN FUNCTIONS
// Functions called by api/dependency/process depending on type of input
export async function processNameDependency(name: string): Promise<{ type: string, text: string} | null> {
  const githubLink = await repoNameToGithubLink(name);
  if (!githubLink) return null;

  const licenseData = await getRepoLicense(githubLink);
  return licenseData;
}

export async function processLinkDependency(link: string): Promise<{ type: string, text: string } | null> {
  const licenseData = await getRepoLicense(link);
  return licenseData;
}


// HELPER FUNCTIONS
async function repoNameToGithubLink(name: string): Promise<string | null> {
  console.log('Running: repoNameToGithubLink');
  try {
    // Prompt: Get Google search query
    const searchQueryPrompt = `Given this dependency: ${name}, generate the best search query to find its official GitHub repository link. Format it like this: owner repository official github repositor

Return ONLY valid JSON in this exact format:
{"data": "your search query here"}

No explanations, no markdown, just the JSON.`
    
    // Get Google search query
    const searchQuery = await getGeminiJsonResponse(searchQueryPrompt) || `${name} Github`;

    // Search Google
    const searchJson = await braveSearch(searchQuery);

    console.log('SEARCH JSON', name, ' -> ', searchJson);

    // Prompt: Find Github link from Google search
    const findGithubLink = `Given this search result: ${searchJson}, choose the Github repository index that best matches this dependency name: ${name}. Return the index to the repository of this dependency: ${name}. Do not return a link to the owner or file. If there is no good match, return an empty string.
    
Return ONLY valid JSON in this exact format:
{"data": "your search result index here"}

No explanatoins, no markdown, just the JSON`

    // Find Github link from Google search
    const githubIndex = await getGeminiJsonResponse(findGithubLink) || '0';

    try {
      const index = Math.max(0, Math.min(searchJson.results.length - 1, parseInt(githubIndex)));
      const link = searchJson.results[index]?.url || searchJson.result[0].url;
      return link;
    } catch { }

    return searchJson.result[0].url;
    
  } catch (e: any) {
    console.log(`lib/dependency_processors/github reponameToGithubLink error: ${e.message}`);
  }
  console.log('Ending: repoNameToGithubLink')
  return null;
}

async function getRepoLicense(link: string): Promise<{ type: string; text: string } | null> {
  console.log('Running: getRepoLicense');
  try {
    // Get repo metadata
    const linkMetadata = getRepoMetadata(link);
    if (!linkMetadata) return null
    const { owner, repo, cleanRepo } = linkMetadata;
    
    // Get default branch name
    const repoInfo = await axios.get(`https://api.github.com/repos/${owner}/${cleanRepo}`, {validateStatus: () => true});
    if (!repoInfo.data.default_branch) return null;
    const defaultBranch = repoInfo.data.default_branch;

    // Get & parse repo file tree
    const response = await axios.get<GitHubTree>(`https://api.github.com/repos/${owner}/${cleanRepo}/git/trees/${defaultBranch}?recursive=1`);
    const reposityStructure = parseRepoTree(response.data.tree);

    // Prompt: Get the path to the license file in repo file tree
    const licensePathPrompt = `You are analyzing a GitHub repository structure to locate the license file.

Repository structure:
${reposityStructure}

Task: Find the path to the LICENSE file from the repository root.

Common license file names include:
- LICENSE, LICENSE.md, LICENSE.txt
- LICENCE, LICENCE.md, LICENCE.txt  
- license, license.md, license.txt
- COPYING

Requirements:
- Return the EXACT path as it appears in the structure
- If no license file exists, return an empty string ""
- Return ONLY valid JSON, no markdown code blocks, no explanations

Expected JSON format:
{"data": "LICENSE.md"}

or if not found:
{"data": ""}`;
    
    console.log(`REPO TREE DEBUGGING: ${link} -> ${reposityStructure}`);
    
    // Get the license file path from the repo
    const path = await getGeminiJsonResponse(licensePathPrompt);
    if (!path) return null;
    
    // Get the file data
    const licenseFile = await getRepoFile(link, path);
    if (!licenseFile) return null;
    
    // Prompt: Get license type from file data
    const licenseTypePrompt = `You are analyzing a license file to identify its type.

License content:
${licenseFile}

Task: Identify the license type using SPDX identifiers when possible.

Classification rules:
1. If it matches a standard SPDX license exactly, return the SPDX identifier (e.g., "MIT", "Apache-2.0", "GPL-3.0", "BSD-3-Clause")
2. If it's a modified version of a known license, prefix with "Modified " (e.g., "Modified MIT", "Modified Apache-2.0")
3. If it's a custom or unrecognizable license, return "Custom"

Common SPDX identifiers:
- MIT, Apache-2.0, GPL-2.0, GPL-3.0, BSD-2-Clause, BSD-3-Clause, ISC, MPL-2.0, LGPL-2.1, LGPL-3.0, AGPL-3.0, Unlicense, CC0-1.0

Look for key phrases:
- "MIT License" → MIT
- "Apache License, Version 2.0" → Apache-2.0
- "GNU General Public License" → GPL-2.0 or GPL-3.0
- Modified versions will have custom terms or removed sections

Requirements:
- Return ONLY valid JSON, no markdown code blocks, no explanations
- Use exact SPDX identifiers from the list above

Expected JSON format:
{"data": "MIT"}

or for modified:
{"data": "Modified Apache-2.0"}

or for custom:
{"data": "Custom License"}`;
    
    // Get license type from file data
    const licenseType = await getGeminiJsonResponse(licenseTypePrompt);
    if (!licenseType) return { type: 'Unknown license', text: licenseFile };

    return { type: licenseType, text: licenseFile };
  } catch (e: any) {
    console.log(`lib/dependency_processors/github getRepoLicense error: ${e.message}`);
  }
  console.log('Ending: getRepoLicense');
  return null;
}
