export class ShareXtExtension {
  private _name: string;
  private _author: string;
  private _description: string;
  private _id: string;
  private _iconSrc?: string;
  private _downloads: number;

  constructor({
    name,
    author,
    description,
    id,
    iconSrc,
    downloads,
  }: {
    name: string;
    author: string;
    description: string;
    id: string;
    iconSrc?: string;
    downloads?: number;
  }) {
    this._name = name;
    this._author = author;
    this._description = description;
    this._id = id;
    this._iconSrc = iconSrc;
    this._downloads = downloads || 0;
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

  get downloads(): number {
    return this._downloads;
  }
}
