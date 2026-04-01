// Type for the player pre lookup data from the mojang API
export type PreLookupData = {
  id: string;
  name: string;
};

// Type for the player profile data from the mojang API
export type ProfileData = {
  properties: [
    {
      value: string;
    },
  ];
};

// Type for the decoded base64 player profile data
export type TextureDataDecoded = {
  profileName: string;
  profileId: string;
  textures: {
    SKIN: {
      url: string;
      metadata?: {
        model?: string;
      };
    };
    CAPE?: {
      url: string;
    };
  };
};

// Type for returned data
export type ResponseData = {
  name: string;
  uuid: string;
  skinId: string;
  playerModel: string;
  skinUrl: string;
  capeUrl?: string;
};
