const axios = require("axios");
import { VsCExtension, VsCExtensionRepository } from "../..";

export interface MarketplaceRepoConfig {
  apiUrl: string;
  apiVersion: string;
}

export class MarketplaceRepo implements VsCExtensionRepository {
  private readonly _config: MarketplaceRepoConfig;

  constructor(
    config: MarketplaceRepoConfig = {
      apiUrl: `https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery`,
      apiVersion: `7.2-preview.1`,
    }
  ) {
    this._config = config;
  }

  async getExtensionById(extensionId: string): Promise<VsCExtension> {
    const response = await axios.post(
      this._config.apiUrl,
      {
        filters: [
          {
            criteria: [
              {
                filterType: 7,
                value: extensionId,
              },
            ],
            pageSize: 100,
            pageNumber: 1,
            sortBy: 0,
            sortOrder: 0,
          },
        ],
        flags: 2151, // Includes versions
      },
      {
        headers: {
          Accept: `application/json;api-version=${this._config.apiVersion};excludeUrls=true`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = response.data;
    if (!data.results[0].extensions.length) {
      throw new Error(`Extension with id '${extensionId}' not found`);
    }

    const extFromData: any = data.results[0].extensions[0];
    const latestVersion = extFromData.versions[0];

    const smallIconUrl = latestVersion.files.find(
      (f: any) => f.assetType === "Microsoft.VisualStudio.Services.Icons.Small"
    )?.source;

    const ext = new VsCExtension({
      id: extensionId,
      name: extFromData.extensionName,
      author: extFromData.publisher.displayName,
      description: extFromData.shortDescription,
      iconSrc: smallIconUrl,
    });

    return ext;
  }
}
