import React from "react";

interface GovIconProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Componente base para Govicons (fonte CSS)
 * Uso: <GovIcon name="vote" className="text-blue-600" />
 */
export const GovIcon: React.FC<GovIconProps & { name: string }> = ({ name, className = "", style }) => (
  <i className={`gi gi-${name} ${className}`} style={style} />
);

// Ícones políticos específicos como componentes
export const IconVote: React.FC<GovIconProps> = (props) => <GovIcon name="vote" {...props} />;
export const IconGavel: React.FC<GovIconProps> = (props) => <GovIcon name="gavel" {...props} />;
export const IconHandshake: React.FC<GovIconProps> = (props) => <GovIcon name="handshake" {...props} />;
export const IconPolitician: React.FC<GovIconProps> = (props) => <GovIcon name="user-politician" {...props} />;
export const IconCapitol: React.FC<GovIconProps> = (props) => <GovIcon name="capitol" {...props} />;
export const IconWhiteHouse: React.FC<GovIconProps> = (props) => <GovIcon name="white-house" {...props} />;
export const IconBalance: React.FC<GovIconProps> = (props) => <GovIcon name="balance" {...props} />;
export const IconMedalStar: React.FC<GovIconProps> = (props) => <GovIcon name="medal-star" {...props} />;
export const IconMedalCircle: React.FC<GovIconProps> = (props) => <GovIcon name="medal-circle" {...props} />;
export const IconRibbon: React.FC<GovIconProps> = (props) => <GovIcon name="ribbon" {...props} />;
export const IconFlagWavy: React.FC<GovIconProps> = (props) => <GovIcon name="us-flag-wavy" {...props} />;
export const IconFlagStraight: React.FC<GovIconProps> = (props) => <GovIcon name="us-flag-straight" {...props} />;
export const IconUSMap: React.FC<GovIconProps> = (props) => <GovIcon name="us-map" {...props} />;
export const IconWorld: React.FC<GovIconProps> = (props) => <GovIcon name="world" {...props} />;
export const IconGovShield: React.FC<GovIconProps> = (props) => <GovIcon name="shield" {...props} />;
export const IconIDCard: React.FC<GovIconProps> = (props) => <GovIcon name="id-card" {...props} />;
export const IconFingerprint: React.FC<GovIconProps> = (props) => <GovIcon name="fingerprint" {...props} />;
export const IconMoney: React.FC<GovIconProps> = (props) => <GovIcon name="money" {...props} />;
export const IconUSD: React.FC<GovIconProps> = (props) => <GovIcon name="usd" {...props} />;
export const IconPieChart: React.FC<GovIconProps> = (props) => <GovIcon name="pie-chart" {...props} />;
export const IconBarChart: React.FC<GovIconProps> = (props) => <GovIcon name="bar-chart" {...props} />;
export const IconLineChart: React.FC<GovIconProps> = (props) => <GovIcon name="line-chart" {...props} />;
export const IconGovDatabase: React.FC<GovIconProps> = (props) => <GovIcon name="database" {...props} />;
export const IconGovCloud: React.FC<GovIconProps> = (props) => <GovIcon name="cloud" {...props} />;
export const IconGovSearch: React.FC<GovIconProps> = (props) => <GovIcon name="search" {...props} />;
export const IconComment: React.FC<GovIconProps> = (props) => <GovIcon name="comment" {...props} />;
export const IconComments: React.FC<GovIconProps> = (props) => <GovIcon name="comments" {...props} />;
export const IconGovCheck: React.FC<GovIconProps> = (props) => <GovIcon name="check" {...props} />;
export const IconGovCheckSquare: React.FC<GovIconProps> = (props) => <GovIcon name="check-square-o" {...props} />;
export const IconGovWarning: React.FC<GovIconProps> = (props) => <GovIcon name="warning" {...props} />;
export const IconGovKey: React.FC<GovIconProps> = (props) => <GovIcon name="key" {...props} />;
export const IconGovFolder: React.FC<GovIconProps> = (props) => <GovIcon name="folder" {...props} />;
export const IconGovTable: React.FC<GovIconProps> = (props) => <GovIcon name="table" {...props} />;
export const IconGovUnlock: React.FC<GovIconProps> = (props) => <GovIcon name="unlock" {...props} />;
export const IconGovLock: React.FC<GovIconProps> = (props) => <GovIcon name="lock" {...props} />;
export const IconGovCog: React.FC<GovIconProps> = (props) => <GovIcon name="cog" {...props} />;
export const IconGovCogs: React.FC<GovIconProps> = (props) => <GovIcon name="cogs" {...props} />;
export const IconGovStar: React.FC<GovIconProps> = (props) => <GovIcon name="star" {...props} />;
export const IconGovUser: React.FC<GovIconProps> = (props) => <GovIcon name="user" {...props} />;
export const IconGovUsers: React.FC<GovIconProps> = (props) => <GovIcon name="users" {...props} />;
export const IconUserSuit: React.FC<GovIconProps> = (props) => <GovIcon name="user-suit" {...props} />;
export const IconUserGraduate: React.FC<GovIconProps> = (props) => <GovIcon name="user-graduate" {...props} />;
export const IconPresenter: React.FC<GovIconProps> = (props) => <GovIcon name="presenter" {...props} />;
export const IconGovFile: React.FC<GovIconProps> = (props) => <GovIcon name="file" {...props} />;
export const IconGovFileText: React.FC<GovIconProps> = (props) => <GovIcon name="file-text" {...props} />;
export const IconGovFileO: React.FC<GovIconProps> = (props) => <GovIcon name="file-o" {...props} />;
export const IconGovFileTextO: React.FC<GovIconProps> = (props) => <GovIcon name="file-text-o" {...props} />;
export const IconFileWord: React.FC<GovIconProps> = (props) => <GovIcon name="file-word-o" {...props} />;
export const IconFileExcel: React.FC<GovIconProps> = (props) => <GovIcon name="file-excel-o" {...props} />;
export const IconFileContract: React.FC<GovIconProps> = (props) => <GovIcon name="file-contract-o" {...props} />;
export const IconGovBuilding: React.FC<GovIconProps> = (props) => <GovIcon name="building" {...props} />;
export const IconStatueLiberty: React.FC<GovIconProps> = (props) => <GovIcon name="statue-of-liberty" {...props} />;
export const IconLibertyBell: React.FC<GovIconProps> = (props) => <GovIcon name="liberty-bell" {...props} />;
export const IconWashingtonMonument: React.FC<GovIconProps> = (props) => <GovIcon name="washington-monument" {...props} />;
export const IconPentagon: React.FC<GovIconProps> = (props) => <GovIcon name="pentagon" {...props} />;
