// Type for the player UUID data from the minetools API
export type UuidData = {
  id: string;
  name: string;
};

// Type for the player profile data from the minetools API
export type ProfileData = {
  raw: {
    properties: [
      {
        value: string;
      },
    ];
  };
};

// Type for the decoded base64 player profile data
export type TextureDataDecoded = {
  profileName: string;
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
