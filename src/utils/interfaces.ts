// Removed Svelte imports
// import type { Subscriber, Unsubscriber, Updater, Writable } from 'svelte/store';
// import type { DisplayType, Role } from '../constants/index';

// Mocking missing types from constants
export type DisplayType = any;
export type Role = any;

export type FormatToken =
  | 'YYYY'
  | 'mm'
  | 'MMMM'
  | 'MMM'
  | 'DD'
  | 'dddd'
  | 'ddd'
  | 'HH'
  | 'hh'
  | 'ss'
  | 'a';

export type StatusType = 'error' | 'success';

export type iResult = {
  status: StatusType;
  message: string;
  data?: any;
};

export type ModalType = 'competition' | 'view-product' | 'view-competition' | 'cleanup' | 'seller-extraction'

export type MessageRoleType = 'user' | 'assistant';

export type TCollection = 'services' | 'slides' | 'affiliates' | 'blog' | 'schools';

export type TService =
  | 'affiliate program'
  | 'tuition payment'
  | 'accommodation'
  | 'dhub career'
  | 'guardianship'
  | 'immigration & recruitment';

export type TPlayMedia = 'play-video' | 'play-audio' | 'play-image' | 'play-newsletter';

export type FileType = 'audio' | 'video' | 'file' | 'image';

export type TCountryCode = "ng" | "eg" | "ci" | "ug" | "ke" | "sn" | "ma" | "gh" | "dz"

export type TCountryLocale = ".com.ng" | ".com.eg" | ".ci" | ".ug" | ".co.ke" | ".sn" | ".ma" | ".com.gh" | ".com.dz" | string

export type TCompetitor = 'temu' | 'jiji' | 'konga' | 'biddy' | 'slot' | 'momomarket' | 'kilimall' | 'babiken' | 'djok' | 'amazon' | 'btech' | 'twob' | 'carrefour' | 'abanista' | 'dombelo' | 'tonaton' | 'decathlon' | 'iris' | 'ultrapc' | 'diardzair' | 'footland' | 'soumari' | 'noon' | 'marjanemall' | 'shein' | 'electroplanet'

export type TState = "idle" | "pending" | "error" | "success"

export type TCatalog = "homepage" | "catalog" | "searchresults"

export type TCategoryLevel = "L1" | "L2" | "L3" | "L4"

export interface iXata {
  xata_createdat: Date;
  xata_updatedat: Date;
  xata_version: number;
  xata_id: string;
}

export interface iFirecrawlApis {
  ng: string;
  eg: string;
  ke: string;
  gh: string;
  ug: string;
  ci: string;
  ma: string;
  dz: string;
  sn: string;
  extra: string[]
}

export interface iFirecrawlPollResult {
  success: boolean;
  data: any[];              // adjust `any` → concrete type if you know item structure
  status: "completed" | "processing" | "failed" | "concelled";           // could be narrowed to union if few known values
  expiresAt: string; // using string, representing ISO‑8601 date :contentReference[oaicite:1]{index=1}
  sessionIds: string[];     // array of strings
}

export interface iUser extends iXata {
  email: string;
  image: string;
  name: string;
  nameTag: string;
  userId: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface iGoogleUser {
  name: string;
  email: string;
  picture: string;
}

export interface iRoute {
  name: string;
  href: string;
  icon?: any;
  isAuthorized?: boolean;
}

export interface iSoMeRoute extends iRoute {
  name: 'facebook' | 'instagram' | 'youtube' | 'twitter' | 'telegram' | 'whatsapp' | 'tiktok';
}

export interface iContactRoute extends iRoute {
  name: 'mail' | 'call' | 'locate';
}

export interface iLegalRoute extends iRoute {
  name: 'terms of use' | 'cookie policy' | 'privacy policy';
}

export interface iModal {
  className?: string;
  type: ModalType;
  open: boolean;
  data?: any;
  title: string;
  description: string
}

export interface iMeta {
  title: string;
  keywords: string[];
  description: string;
  ogimage: string;
  link: string;
}

export interface iFile extends iXata {
  url: string;
  fileId: string;
  size: string;
}

export interface iDocumentCategory extends iXata {
  category: string;
  file?: string | iFile;
  content?: string;
}

export interface iDocument extends iXata {
  title: string;
  content: string;
  category: string | iDocumentCategory;
  file?: string | iFile;
}

export interface iFaq extends iXata {
  category: string;
  question: string;
  answer: string;
}

export interface iAccordion {
  question: string;
  answer: string;
}

export interface iUpload {
  url: string;
  fileType: FileType;
  fileId: string;
}

export interface iSection {
  id: string;
  title: string;
  content: string;
}

export interface iHTMLSection {
  id: string;
  title: string;
  content: string;
}

export interface iGlobal {
  identifier: string,
  name: string
}

export interface iPrice {
  discount?: string;
  oldPrice?: string;
  oldPriceEuro: string;
  price: string;
  priceEuro: string;
  rawPrice: string;
  taxEuro: string;
}

export interface iRating {
  average: number;
  totalRatings: number;
}

export interface iMain {
  name: string;
  identifier: string;
  url: string;
}

export interface iCampaign {
  name: string;
  identifier: string;
  image: string;
  url: string;
  bgColor: string;
  txtColor: string;
}

export interface iSimple {
  sku: string;
  loginUrl: string;
  isBuyable: boolean;
  name: string;
  prices: iPrice
}

export interface iSKU {
  metadata?: Record<string, any>;
  sku: string;
  name: string;
  details?: string;
  displayName: string;
  brand: string;
  sellerId: number;
  isShopExpress?: boolean;
  categories: string[];
  prices: iPrice;
  tags: string;
  rating?: iRating,
  image: string;
  url: string;
  badges?: {
    campaign: iCampaign;
    main: iMain;
  },
  isBuyable: boolean
  shopExpress?: {
    title: string;
  },
  competition?: Record<string, any>,
  shopGlobal?: iGlobal,
  simples?: iSimple[],
  selectedVariation?: string;
  variationSelection?: boolean;
  sellerName?: string;
}


export interface iPayload {
  products: iSKU[];
  competitors: string[];
  country: TCountryCode
  countryName: string;
}

export interface iFlattenedSKU {
  sku: string;
  name: string;
  brand: string;
  isShopExpress?: boolean;
  category: string;
  price: string;
  oldPrice?: string;
  image: string;
  url: string;
  discount?: string;
  averageRatings?: number;
  totalRatings?: number;
  campaignBadge?: boolean;
  campaignBadgeName: string;
  campaignBadgeImage: string;
  campaignBadgeTextColor: string;
  campaignBadgeBgColor: string
  mainBadge?: boolean;
  mainBadgeName: string;
  isBuyable: boolean;
  shopExpress?: string;
  shopGlobal?: boolean;
  shopGlobalName?: string;
}


export interface iSKUStore {
  jumia: Record<string, iSKU>;
  country: iCountry;
  url: string;
  page: number;
  displayType: DisplayType;
  reset: () => void
}

export interface iCleanupStore {
  jumia: Record<string, iSKU>;
  country: iCountry;
  url: string;
  page: number;
  list: string[];
  reset: () => void
}

export interface iCountry {
  name: string;
  code: TCountryCode;
  locale: TCountryLocale;
}

export interface iCompetition {
  name: string;
  logo: any;
  imageBucket?: string;
}

export interface iBiddyProduct {
  score: number;
  id: string;
  profileId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  postedAt: string;
  category: string;
  subCategory: string;
  youtubeURL: string;
  state: string;
  LGA: string;
  rating: number;
  imagesURL: string[];
  Status: string;
  shippingLocations: string[];
  ListingMethod: string;
  adPremiumType: string;
  premiumExipryDate: string | null;
  estDeliveryTime: string;
  returnPolicy: boolean;
  signedBy: string;
  clutter: string;
  BANG: string | null;
  lockInPaymentUserIds: string[];
  auctionWinnerProfileId: string | null;
  views: any[];
  shared: any[];
  productVerificationErrorMessage: string;
  ShippingFee: IShippingFee;
  ListingDetails: IListingDetails;
  ProductCategoryDetails: IProductCategoryDetails;
  AuctionTransactions: any[];
  InstantBuyTransactions: any[];
}

interface IShippingFee {
  id: string;
  productId: string;
  createdAt: string;
  updatedAt: string;
  Abia: number | null;
  Abuja: number | null;
  Adamawa: number | null;
  AkwaIbom: number | null;
  Anambra: number | null;
  Bauchi: number | null;
  Bayelsa: number | null;
  Benue: number | null;
  Borno: number | null;
  CrossRiver: number | null;
  Delta: number | null;
  Ebonyi: number | null;
  Edo: number | null;
  Ekiti: number | null;
  Enugu: number | null;
  Gombe: number | null;
  Imo: number | null;
  Jigawa: number | null;
  Kaduna: number | null;
  Kano: number | null;
  Katsina: number | null;
  Kebbi: number | null;
  Kogi: number | null;
  Kwara: number | null;
  Lagos: number | null;
  Nasarawa: number | null;
  Niger: number | null;
  Ogun: number | null;
  Ondo: number | null;
  Osun: number | null;
  Oyo: number | null;
  Plateau: number | null;
  Rivers: number | null;
  Sokoto: number | null;
  Taraba: number | null;
  Yobe: number | null;
  Zamfara: number | null;
}

interface IListingDetails {
  id: string;
  productId: string;
  Price: number;
  NumberOfProducts: number | null;
  soldAmount: number | null;
  StartingPrice: number | null;
  ReservePrice: number | null;
  BuyItNowPrice: number | null;
  AuctionTime: number | null;
  ExpirationTime: number | null;
  auctionStartingTime: number | null;
  CurrentPrice: number | null;
  PhoneNumber: string;
  createdAt: string;
  updatedAt: string;
}

interface IProductCategoryDetails {
  id: string;
  productId: string;
  createdAt: string;
  updatedAt: string;
  type: string;
  Genre: string | null;
  Subject: string | null;
  AgeGroup: string | null;
  Theme: string | null;
  ReleaseYear: string | null;
  Format: string | null;
  condition: string;
  ComicGenre: string | null;
  Publisher: string | null;
  Era: string | null;
  PaintingStyle: string | null;
  Artist: string | null;
  PrintType: string | null;
  SculptureType: string | null;
  displayName: string | null;
  brand: string;
  Connectivity: string | null;
  packaging: string | null;
  length: string | null;
  Make: string | null;
  Megapixels: string | null;
  OperatingSystem: string | null;
  color: string | null;
  RAMType: string | null;
  RAMSize: string | null;
  Cores: string | null;
  StorageType: string | null;
  StorageCapacity: string | null;
  DisplaySize: string | null;
  GraphicsCard: string | null;
  GraphicsMemory: string | null;
  gender: string | null;
  size: string | null;
  ApparelType: string | null;
  style: string | null;
  Pattern: string | null;
  Finish: string | null;
  Usage: string | null;
  ClosureType: string | null;
  ToeStyle: string | null;
  Occasion: string | null;
  HeelHeight: string | null;
  material: string | null;
  organization: string | null;
  decor: string | null;
  theme: string | null;
  room: string | null;
  energyEfficiency: string;
  warrantyOptions: string;
  accessories: string;
  safetyFeatures: string;
  installationOption: string;
  communication: string | null;
  compatibility: string | null;
  smartHomeIntegration: string | null;
  securityFeatures: string | null;
  healthAndFitness: string | null;
  displayFeatures: string | null;
  voiceControl: string | null;
  privacySettings: string | null;
  Species: string | null;
  age: string | null;
  Size: string | null;
  injury: string | null;
  Breed: string | null;
  RAMCapacity: string | null;
  BiometricFeatures: string | null;
  SIMCapability: string | null;
  model: string | null;
  MainCamera: string | null;
  SelfieCamera: string | null;
  Bedroom: string | null;
  Bathroom: string | null;
  SquareMeter: string | null;
  Floor: string | null;
  Furnished: string | null;
  Utilities: string | null;
  Amenities: any[];
  Accessibility: string | null;
  Address: string | null;
  Zoning: string | null;
  Features: any[];
  Garage: string | null;
  Yard: string | null;
  Facilities: any[];
  make: string | null;
  ManufacturingYear: string | null;
  Transmission: string | null;
  FuelType: string | null;
  DriveType: string | null;
  BodyStyle: string | null;
  CargoBedLength: string | null;
  TowingCapacity: string | null;
  InteriorMaterial: string | null;
  ExtraFeatures: any[];
  Fault: any[];
  Mileage: string | null;
  VIN: string | null;
  HorsePower: string | null;
  Seats: string | null;
  Cylinders: string | null;
  SuspensionType: string | null;
  ml: string | null;
  ConsoleType: string | null;
  Platform: string | null;
  cementWeight: string | null;
  steelType: string | null;
  paintType: string | null;
  adhesivesType: string | null;
  woodType: string | null;
  roofingType: string | null;
  pipesType: string | null;
  flooringType: string | null;
  finish: string | null;
  handle: string | null;
  location: string | null;
  securityFeature: string | null;
  powerSource: string | null;
  application: string | null;
  feature: string | null;
  shape: string | null;
  frameMaterial: string | null;
  glassType: string | null;
  frameType: string | null;
  openingStyle: string | null;
}

export interface iGenericCompetitor {
  id: string;
  image: string;
  href: string;
  url?: string;
  price: number | string;
  timestamp?: any
  created_at?: string;
  sku?: string;
  jumia_name?: string;
  competitor?: string;
  name: string;
  title: string;
}


export interface iJijiProduct {
  condition: string;
  labels: string[];
  region: string;
}

export interface iKeyData {
  key: string;
  data: string;
}

export interface iOption {
  label: string;
  value: string;
}

export interface iMinMax {
  min: number;
  max: number
}

export interface iFilter {
  search: string;
  category: string;
  tag: string;
  express: boolean;
  brand: string;
  seller: string;
  price: iMinMax;
  discount: string;
  rating: string;
}

export const CompetitorMetadata = {
  JIJI_NG_PDP: 'https://jiji.ng',
  KONGA_PDP: 'https://www.konga.com'
};
