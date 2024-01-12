export class Extension {
  private readonly _id: string;
  private readonly _name: string;
  private readonly _author: string;
  private readonly _description: string;
  private readonly _marketplaceUrl: string;
  private readonly _iconSrc?: string;
  private readonly _installed?: boolean;

  constructor({
    name,
    author,
    description,
    id,
    iconSrc,
    installed,
  }: {
    name: string;
    author: string;
    description: string;
    id: string;
    iconSrc?: string;
    installed?: boolean;
  }) {
    this._name = name;
    this._author = author;
    this._description = description;
    this._id = id;
    this._iconSrc = iconSrc;
    this._marketplaceUrl = `https://marketplace.visualstudio.com/items?itemName=${this._id}`;
    this._installed = installed;
  }

  public toJSON(): string {
    return JSON.stringify(
      {
        id: this._id,
        name: this._name,
        author: this._author,
        description: this._description,
        iconSrc: this._iconSrc,
        marketplaceUrl: this._marketplaceUrl,
      },
      null,
      2
    );
  }

  static fromJSON(jsonStr: string): Extension {
    const json = JSON.parse(jsonStr);
    return new Extension({
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

  get installed(): boolean | undefined {
    return this._installed;
  }

  get html(): string {
    return `
    <div class="extension__container">
        <img src="${this._iconSrc}"
            alt="${this._name} icon" style="width: 2.625rem;">
        <div class="extension__info">
            <strong>${this._name}</strong>
            <span>${this._description}</span>
            <div class="extension__author">
                <small><b>${this._author}</b></small>
                <div class="extension_btns">
                    <a href=" ${this._marketplaceUrl}" target="_blank" rel="noopener noreferrer" class="btn">
                        Install
                    </a>
                    <a href=" ${this._marketplaceUrl}" target="_blank" rel="noopener noreferrer" class="btn">
                        Marketplace
                    </a>
                </div>
            </div>
        </div>
    </div>
    `;
  }
}

export interface ExtensionRepository {
  getExtensionById(extensionId: string): Promise<Extension>;
}
