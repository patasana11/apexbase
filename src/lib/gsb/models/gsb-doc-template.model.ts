import { GsbUser } from './gsb-user.model';

/**
 * Document template model
 */
export interface GsbDocTemplate {
  thumbnail_id?: string;
  mailings?: any[];
  fileName?: string;
  createdBy?: GsbUser;
  name: string;
  module?: any;
  categories?: any[];
  mlContent_id?: string;
  html?: string;
  createDate?: Date;
  title?: string;
  lastUpdatedBy?: GsbUser;
  isMultilingual?: boolean;
  module_id?: string;
  mlContent?: any;
  languageScript?: string;
  id: string;
  thumbnail?: any;
  tags?: any[];
  test?: string;
  createdBy_id?: string;
  defaultPrintOptions?: string;
  lastUpdateDate?: Date;
  enableOverride?: boolean;
  lastUpdatedBy_id?: string;
  
  // Add a templateType field for filtering
  templateType?: string;
} 