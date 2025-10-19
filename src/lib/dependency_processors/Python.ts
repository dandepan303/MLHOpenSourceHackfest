import axios from 'axios';
import { getGeminiJsonResponse } from "../dependency_helpers/AI";
import { googleSearch } from "../dependency_helpers/Search";

interface PyPIPackageInfo {
  info: {
    license?: string;
    classifiers?: string[];
    home_page?: string;
    project_urls?: Record<string, string>;
  };
}

// MAIN FUNCTIONS
export async function processPythonDependency(data: string): Promise<{ type: string, text: string }> {
  try {
    // Get package PyPi link
    const packageName = await packageDataToName(data);
    if (!packageName) return { type: 'Unknown - potentially private/internal', text: '' };
    
    // Get license from PyPi data
    const licenseData = await getPackageLicense(packageName);
    if (!licenseData) return { type: 'Unknown - potentially private/internal', text: '' };
    
    return licenseData;
  } catch (e: any) {
    console.log(`lib/dependency_processors/python processPythonDependency error: ${e.message}`);
  }
  return { type: 'Unknown - potentially private/internal', text: '' };
}

// HELPER FUNCTIONS
async function packageDataToName(name: string): Promise<string | null> {
  try {
    // Prompt: Get Google search query
    const googleSearchQueryPrompt = `Given this python package dependency: ${name}, return the best Google search query to find its official PyPi page.

Return ONLY valid JSON in this exact format:
{"data": "your search query here"}

No explanations, no markdown, just the JSON.`
    
    // Get Google search query
    const googleSearchQuery = await getGeminiJsonResponse(googleSearchQueryPrompt) || `${name} PyPi package`;

    // Search Google
    const googleSearchJson = await googleSearch(googleSearchQuery);

    // Prompt: Find PyPi package link from Google search
    const findPackageLink = `Given this python package dependency: ${name} and this google search query: ${googleSearchJson}, return the official name of the package.

Return ONLY valid JSON in this exact format:
{"data": "your PyPi name here"}

No explanations, no markdown, just the JSON.`

    // Find Github link from Google search
    const packageName = getGeminiJsonResponse(findPackageLink) || null;
    
    return packageName;
  } catch (e: any) {
    console.log(`lib/dependency_processors/python packageDataToname error: ${e.message}`);
  }
  return null;
}

export async function getPackageLicense(name: string): Promise<{ type: string, text: string } | null> {
  const apiUrl = `https://pypi.org/pypi/${name}/json`;
  
  const response = await axios.get<PyPIPackageInfo>(apiUrl, { validateStatus: () => true });
  const info = response.data.info;

  console.log(`PYTHON DEBUGGING: ${response.data}`)

  if (!info) return null;

  let licenseType = info.license || '';
  // licenseType is unknown and classifiers exists
  if ((!licenseType || licenseType === 'UNKNOWN') && info.classifiers) {
    const licenseClassifiers = info.classifiers.find(c => c.startsWith('License ::'))

    if (licenseClassifiers) {
      const licensesList = licenseClassifiers.split('::');
      licenseType = licensesList[licensesList.length - 1].trim();
    }
  }

  // TODO: Inform text based on license type

  return { type: licenseType, text: '' };
}