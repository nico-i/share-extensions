export class VsCExtension {
  private readonly _name: string;
  private readonly _author: string;
  private readonly _description: string;
  private readonly _id: string;
  private readonly _iconSrc?: string;
  private readonly _marketplaceUrl: string;

  constructor({
    name,
    author,
    description,
    id,
    iconSrc,
  }: {
    name: string;
    author: string;
    description: string;
    id: string;
    iconSrc?: string;
  }) {
    this._name = name;
    this._author = author;
    this._description = description;
    this._id = id;
    this._iconSrc = iconSrc;
    this._marketplaceUrl = `https://marketplace.visualstudio.com/items?itemName=${this._id}`;
  }

  public toJSON(): string {
    return JSON.stringify(
      {
        id: this._id,
        name: this._name,
        author: this._author,
        description: this._description,
        iconSrc: this._iconSrc,
      },
      null,
      2
    );
  }

  static fromJSON(jsonStr: string): VsCExtension {
    const json = JSON.parse(jsonStr);
    return new VsCExtension({
      id: json.id,
      name: json.name,
      author: json.author,
      description: json.description,
      iconSrc: json.iconSrc,
    });
  }

  get name(): string {
    return this._name;
  }

  get author(): string {
    return this._author;
  }

  get description(): string {
    return this._description;
  }

  get id(): string {
    return this._id;
  }

  get iconSrc(): string | undefined {
    return this._iconSrc;
  }

  get marketplaceUrl(): string {
    return this._marketplaceUrl;
  }

  get html(): string {
    return `
    <div style="display: flex; flex-direction: row; align-items: center; justify-content: space-between; padding: 14px 16px;">
      <div style="display: flex; flex-direction: justify-items: start; align-items: center; gap: 16px;">
          <img src="${this._iconSrc}" alt="${this._name} icon" style="width: 42px;" />
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <strong style="font-size: 1.15rem;">${this._name}</strong>
            <span>${this.description}</span>
            <small><b>${this._author}</b></small>
          </div>
      </div>
        <a href="${this._marketplaceUrl}" target="_blank" rel="noopener noreferrer" style="align-self: flex-end;">
            View on Marketplace
        </a>
    </div>
    `;
  }
}

export interface VsCExtensionRepository {
  getExtensionById(extensionId: string): Promise<VsCExtension>;
}
