// Upstream data from player APIs
export type UpstreamPlayerData = string | null;

// Upstream data from mojang API pre lookup
export type UpstreamMojangPreData = {
  id: string;
  name: string;
};

// Upstream data from mojang API profile lookup
export type UpstreamMojangData = {
  properties: [
    {
      value: string;
    },
  ];
};

// Upstream data from PlayerDB API profile lookup
export type UpstreamPlayerdbData = {
  data: {
    player: {
      properties: [
        {
          value: string;
        },
      ];
    };
  };
};

// Upstream data from Ashcon API profile lookup
export type UpstreamAshconData = {
  textures: {
    raw: {
      value: string;
    };
  };
};

// Decoded base64 player profile data
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

// Returned data
export type DownstreamData = {
  name: string;
  uuid: string;
  skinId: string;
  playerModel: string;
  skinUrl: string;
  capeUrl?: string;
};
