import { EnumGtmEvent, EnumGtmSource } from '@enums';

export interface GtmTrackInterface {
  /** to control events site-wise */
  event: EnumGtmEvent;
  /** to control where the event is coming from */
  source?: EnumGtmSource;
}
