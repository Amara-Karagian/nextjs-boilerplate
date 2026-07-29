export interface Hotline {
  name: string;
  number: string;
  description?: string;
  available?: string;
  sms?: string;
  chat?: string;
}

export interface CountryHotlines {
  country: string;
  code: string;
  emergency: string;
  police?: string;
  domestic_violence?: Hotline[];
  sexual_assault?: Hotline[];
  crisis?: Hotline[];
}

export const hotlines: CountryHotlines[] = [
  {
    country: 'Afghanistan',
    code: 'AF',
    emergency: '119',
    police: '119',
    domestic_violence: [{ name: 'Afghan Women Network', number: '+93 20 220 2202' }],
  },
  {
    country: 'Albania',
    code: 'AL',
    emergency: '112',
    police: '129',
    domestic_violence: [{ name: 'National Helpline for Gender Violence', number: '116', available: '24/7' }],
    crisis: [{ name: 'Psychosocial Support', number: '0800 4545', available: '24/7' }],
  },
  {
    country: 'Algeria',
    code: 'DZ',
    emergency: '17',
    police: '17',
    domestic_violence: [{ name: 'DGSN Helpline', number: '1548' }],
  },
  {
    country: 'Argentina',
    code: 'AR',
    emergency: '911',
    police: '911',
    domestic_violence: [
      { name: 'Línea 144 — Violencia de Género', number: '144', available: '24/7', description: 'National domestic violence hotline' },
    ],
    crisis: [{ name: 'Centro de Asistencia al Suicida', number: '135', available: '24/7' }],
  },
  {
    country: 'Armenia',
    code: 'AM',
    emergency: '112',
    police: '102',
    domestic_violence: [{ name: 'Women\'s Rights Center', number: '+374 11 53 88 87' }],
    crisis: [{ name: 'Trust Hotline', number: '808', available: '24/7' }],
  },
  {
    country: 'Australia',
    code: 'AU',
    emergency: '000',
    police: '000',
    domestic_violence: [
      { name: '1800RESPECT', number: '1800 737 732', available: '24/7', chat: '1800respect.org.au' },
      { name: 'Safe Steps Family Violence Response Centre', number: '1800 015 188', available: '24/7' },
    ],
    sexual_assault: [
      { name: 'RAINN-equivalent: 1800RESPECT', number: '1800 737 732', available: '24/7' },
    ],
    crisis: [{ name: 'Lifeline', number: '13 11 14', available: '24/7', sms: '0477 13 11 14' }],
  },
  {
    country: 'Austria',
    code: 'AT',
    emergency: '112',
    police: '133',
    domestic_violence: [
      { name: 'Frauenhelpline gegen Gewalt', number: '0800 222 555', available: '24/7', description: 'Free women\'s helpline against violence' },
    ],
    crisis: [{ name: 'Telefonseelsorge', number: '142', available: '24/7' }],
  },
  {
    country: 'Azerbaijan',
    code: 'AZ',
    emergency: '112',
    police: '102',
    domestic_violence: [{ name: 'MSKA Hotline', number: '860', available: '24/7' }],
  },
  {
    country: 'Bangladesh',
    code: 'BD',
    emergency: '999',
    police: '999',
    domestic_violence: [
      { name: 'National Emergency Service', number: '999', available: '24/7' },
      { name: 'Bangladesh National Women Lawyers\' Association', number: '01711-028161' },
    ],
    crisis: [{ name: 'Kaan Pete Roi', number: '01779-554391', available: '24/7' }],
  },
  {
    country: 'Belarus',
    code: 'BY',
    emergency: '112',
    police: '102',
    domestic_violence: [{ name: 'Radislava Crisis Center', number: '+375 17 300-00-00' }],
  },
  {
    country: 'Belgium',
    code: 'BE',
    emergency: '112',
    police: '101',
    domestic_violence: [
      { name: 'Violence conjugale', number: '0800 30 030', available: '24/7' },
    ],
    crisis: [{ name: 'Suicide Prevention Line', number: '0800 32 123', available: '24/7' }],
  },
  {
    country: 'Bolivia',
    code: 'BO',
    emergency: '110',
    police: '110',
    domestic_violence: [{ name: 'Línea de Emergencia Violencia', number: '800 10 0200', available: '24/7' }],
  },
  {
    country: 'Bosnia and Herzegovina',
    code: 'BA',
    emergency: '122',
    police: '122',
    domestic_violence: [{ name: 'SOS Hotline', number: '1265', available: '24/7' }],
  },
  {
    country: 'Brazil',
    code: 'BR',
    emergency: '190',
    police: '190',
    domestic_violence: [
      { name: 'Central de Atendimento à Mulher — Ligue 180', number: '180', available: '24/7', description: 'Free national women\'s helpline' },
      { name: 'SAMU', number: '192', available: '24/7' },
    ],
    crisis: [{ name: 'CVV — Centro de Valorização da Vida', number: '188', available: '24/7', chat: 'cvv.org.br' }],
  },
  {
    country: 'Bulgaria',
    code: 'BG',
    emergency: '112',
    police: '166',
    domestic_violence: [{ name: 'National Violence Hotline', number: '0800 18 676', available: '24/7' }],
  },
  {
    country: 'Cambodia',
    code: 'KH',
    emergency: '117',
    police: '117',
    domestic_violence: [{ name: 'LICADHO Women\'s Rights Hotline', number: '023 213 255' }],
  },
  {
    country: 'Cameroon',
    code: 'CM',
    emergency: '117',
    police: '117',
    domestic_violence: [{ name: 'CAMFAIDS', number: '+237 233 47 47 47' }],
  },
  {
    country: 'Canada',
    code: 'CA',
    emergency: '911',
    police: '911',
    domestic_violence: [
      { name: 'ShelterSafe', number: '1-800-799-7233', available: '24/7', chat: 'sheltersafe.ca' },
      { name: 'Assaulted Women\'s Helpline', number: '1-866-863-0511', available: '24/7', sms: '416-863-0511' },
    ],
    sexual_assault: [
      { name: 'Crisis Services Canada', number: '1-833-456-4566', available: '24/7' },
    ],
    crisis: [{ name: 'Crisis Services Canada', number: '1-833-456-4566', available: '24/7', sms: '45645' }],
  },
  {
    country: 'Chile',
    code: 'CL',
    emergency: '133',
    police: '133',
    domestic_violence: [
      { name: 'Fono Familia', number: '149', available: '24/7', description: 'Free domestic violence helpline' },
    ],
    crisis: [{ name: 'Fono Ayuda', number: '+56 2 2788 2222', available: '24/7' }],
  },
  {
    country: 'China',
    code: 'CN',
    emergency: '110',
    police: '110',
    domestic_violence: [
      { name: 'National Women\'s Hotline', number: '12338', available: '24/7' },
    ],
    crisis: [{ name: 'Beijing Suicide Research & Prevention Center', number: '010-82951332', available: '24/7' }],
  },
  {
    country: 'Colombia',
    code: 'CO',
    emergency: '123',
    police: '123',
    domestic_violence: [
      { name: 'Línea 155 — Mujer', number: '155', available: '24/7', description: 'Free women\'s line' },
    ],
    crisis: [{ name: 'Línea 106', number: '106', available: '24/7' }],
  },
  {
    country: 'Costa Rica',
    code: 'CR',
    emergency: '911',
    police: '911',
    domestic_violence: [{ name: 'INAMU', number: '800-800-4268', available: '24/7' }],
  },
  {
    country: 'Croatia',
    code: 'HR',
    emergency: '112',
    police: '192',
    domestic_violence: [{ name: 'SOS Hotline for Women', number: '01 4828 888' }],
  },
  {
    country: 'Cuba',
    code: 'CU',
    emergency: '106',
    police: '106',
    domestic_violence: [{ name: 'Línea de Orientación Familiar', number: '103' }],
  },
  {
    country: 'Czech Republic',
    code: 'CZ',
    emergency: '112',
    police: '158',
    domestic_violence: [
      { name: 'DONA Linka', number: '251 511 313', available: '24/7' },
    ],
    crisis: [{ name: 'Linka bezpečí', number: '116 111', available: '24/7' }],
  },
  {
    country: 'Denmark',
    code: 'DK',
    emergency: '112',
    police: '114',
    domestic_violence: [
      { name: 'Landsorganisationen af Kvindekrisecentre', number: '70 20 30 82', available: '24/7' },
    ],
    crisis: [{ name: 'Livslinien', number: '70 20 12 01', available: '24/7' }],
  },
  {
    country: 'Dominican Republic',
    code: 'DO',
    emergency: '911',
    police: '911',
    domestic_violence: [{ name: 'Línea de Orientación a la Mujer', number: '809-200-6586' }],
  },
  {
    country: 'Ecuador',
    code: 'EC',
    emergency: '911',
    police: '911',
    domestic_violence: [{ name: 'CEPAM Quito', number: '1800-MUJER' }],
  },
  {
    country: 'Egypt',
    code: 'EG',
    emergency: '123',
    police: '122',
    domestic_violence: [
      { name: 'NCW Hotline', number: '15115', available: '24/7', description: 'National Council for Women' },
    ],
  },
  {
    country: 'Ethiopia',
    code: 'ET',
    emergency: '991',
    police: '991',
    domestic_violence: [{ name: 'Ethiopian Women Lawyers Association', number: '+251 11 552 4595' }],
  },
  {
    country: 'Finland',
    code: 'FI',
    emergency: '112',
    police: '112',
    domestic_violence: [
      { name: 'Naisten Linja', number: '0800 02400', available: '24/7', description: 'Free women\'s line' },
    ],
    crisis: [{ name: 'Mieli Suicide Prevention', number: '09 2525 0111', available: '24/7' }],
  },
  {
    country: 'France',
    code: 'FR',
    emergency: '112',
    police: '17',
    domestic_violence: [
      { name: 'Violences Femmes Info', number: '3919', available: '24/7', description: 'Free violence against women helpline' },
    ],
    sexual_assault: [{ name: 'CFCV Viol Femmes Informations', number: '0800 05 95 95' }],
    crisis: [{ name: 'Numéro National Prévention Suicide', number: '3114', available: '24/7' }],
  },
  {
    country: 'Germany',
    code: 'DE',
    emergency: '112',
    police: '110',
    domestic_violence: [
      { name: 'Hilfetelefon Gewalt gegen Frauen', number: '08000 116 016', available: '24/7', description: 'Free national women\'s helpline' },
    ],
    crisis: [{ name: 'Telefonseelsorge', number: '0800 111 0 111', available: '24/7' }],
  },
  {
    country: 'Ghana',
    code: 'GH',
    emergency: '999',
    police: '191',
    domestic_violence: [{ name: 'Domestic Violence & Victim Support Unit', number: '0800-800-800' }],
    crisis: [{ name: 'Mental Health Authority', number: '0800-111-222' }],
  },
  {
    country: 'Greece',
    code: 'GR',
    emergency: '112',
    police: '100',
    domestic_violence: [
      { name: 'SOS Line for Violence Against Women', number: '15900', available: '24/7' },
    ],
    crisis: [{ name: 'Suicide Prevention Line', number: '10306', available: '24/7' }],
  },
  {
    country: 'Guatemala',
    code: 'GT',
    emergency: '110',
    police: '110',
    domestic_violence: [{ name: 'PGN Helpline', number: '1546' }],
  },
  {
    country: 'Haiti',
    code: 'HT',
    emergency: '114',
    police: '114',
    domestic_violence: [{ name: 'KOFAVIV', number: '+509 3711-2978' }],
  },
  {
    country: 'Honduras',
    code: 'HN',
    emergency: '911',
    police: '911',
    domestic_violence: [{ name: 'INAM', number: '107' }],
  },
  {
    country: 'Hungary',
    code: 'HU',
    emergency: '112',
    police: '107',
    domestic_violence: [
      { name: 'OKIT — National Crisis Management', number: '06 80 20 55 20', available: '24/7' },
    ],
    crisis: [{ name: 'Lelkisegély Telefonszolgálat', number: '116 123', available: '24/7' }],
  },
  {
    country: 'India',
    code: 'IN',
    emergency: '112',
    police: '100',
    domestic_violence: [
      { name: 'National Commission for Women', number: '7827170170', available: '24/7' },
      { name: 'Shakti Shalini', number: '10920', available: '24/7' },
      { name: 'iCall', number: '9152987821' },
    ],
    sexual_assault: [{ name: 'One Stop Centre', number: '181', available: '24/7' }],
    crisis: [{ name: 'Vandrevala Foundation', number: '1860-2662-345', available: '24/7' }],
  },
  {
    country: 'Indonesia',
    code: 'ID',
    emergency: '112',
    police: '110',
    domestic_violence: [
      { name: 'Kementerian PPPA Hotline', number: '129', available: '24/7' },
    ],
    crisis: [{ name: 'Into The Light Crisis Line', number: '119 ext 8' }],
  },
  {
    country: 'Iran',
    code: 'IR',
    emergency: '115',
    police: '110',
    domestic_violence: [{ name: 'Social Emergency', number: '123', available: '24/7' }],
  },
  {
    country: 'Iraq',
    code: 'IQ',
    emergency: '104',
    police: '104',
    domestic_violence: [{ name: 'Ministry of Interior Helpline', number: '130' }],
  },
  {
    country: 'Ireland',
    code: 'IE',
    emergency: '112',
    police: '999',
    domestic_violence: [
      { name: 'Women\'s Aid', number: '1800 341 900', available: '24/7' },
      { name: 'Safe Ireland', number: '090 647 9078' },
    ],
    sexual_assault: [{ name: 'Dublin Rape Crisis Centre', number: '1800 77 8888', available: '24/7' }],
    crisis: [{ name: 'Samaritans', number: '116 123', available: '24/7' }],
  },
  {
    country: 'Israel',
    code: 'IL',
    emergency: '100',
    police: '100',
    domestic_violence: [
      { name: 'Women\'s Hotline', number: '1202', available: '24/7' },
    ],
    crisis: [{ name: 'ERAN', number: '1201', available: '24/7' }],
  },
  {
    country: 'Italy',
    code: 'IT',
    emergency: '112',
    police: '113',
    domestic_violence: [
      { name: '1522 — Anti-Violence and Stalking', number: '1522', available: '24/7', description: 'Free national helpline' },
    ],
    crisis: [{ name: 'Telefono Amico', number: '02 2327 2327', available: '24/7' }],
  },
  {
    country: 'Jamaica',
    code: 'JM',
    emergency: '119',
    police: '119',
    domestic_violence: [
      { name: 'Women\'s Crisis Centre', number: '929-2997' },
    ],
  },
  {
    country: 'Japan',
    code: 'JP',
    emergency: '110',
    police: '110',
    domestic_violence: [
      { name: 'DV Consultation Support Center', number: '0120-279-889', available: '24/7' },
      { name: 'Cabinet Office DV Consultation Plus', number: '#8008', available: '24/7' },
    ],
    crisis: [{ name: 'Inochi no Denwa', number: '0120-783-556', available: '24/7' }],
  },
  {
    country: 'Jordan',
    code: 'JO',
    emergency: '911',
    police: '911',
    domestic_violence: [
      { name: 'National Hotline for Family Protection', number: '110', available: '24/7' },
    ],
  },
  {
    country: 'Kazakhstan',
    code: 'KZ',
    emergency: '112',
    police: '102',
    domestic_violence: [{ name: 'National Helpline', number: '150', available: '24/7' }],
  },
  {
    country: 'Kenya',
    code: 'KE',
    emergency: '999',
    police: '999',
    domestic_violence: [
      { name: 'COVAW Hotline', number: '0800 720 906', available: '24/7' },
      { name: 'Gender Violence Recovery Centre', number: '0719 638 006' },
    ],
    crisis: [{ name: 'Befrienders Kenya', number: '0800 723 253', available: '24/7' }],
  },
  {
    country: 'Lebanon',
    code: 'LB',
    emergency: '112',
    police: '112',
    domestic_violence: [
      { name: 'KAFA Enough Violence & Exploitation', number: '1745', available: '24/7' },
    ],
    crisis: [{ name: 'Embrace Mental Health', number: '1564', available: '24/7' }],
  },
  {
    country: 'Liberia',
    code: 'LR',
    emergency: '911',
    police: '911',
    domestic_violence: [{ name: 'Women NGO Secretariat', number: '+231 886 551 393' }],
  },
  {
    country: 'Malaysia',
    code: 'MY',
    emergency: '999',
    police: '999',
    domestic_violence: [
      { name: 'Talian Kasih', number: '15999', available: '24/7', description: 'National domestic violence helpline' },
      { name: 'Women\'s Aid Organisation', number: '03-7956 3488' },
    ],
    crisis: [{ name: 'Befrienders Malaysia', number: '03-7956 8145', available: '24/7' }],
  },
  {
    country: 'Mexico',
    code: 'MX',
    emergency: '911',
    police: '911',
    domestic_violence: [
      { name: 'INMUJERES — Línea Vida', number: '800-911-2000', available: '24/7' },
      { name: 'Línea Mujer', number: '55 5658-1111' },
    ],
    crisis: [{ name: 'SAPTEL', number: '55 5259-8121', available: '24/7' }],
  },
  {
    country: 'Morocco',
    code: 'MA',
    emergency: '19',
    police: '19',
    domestic_violence: [
      { name: 'Fédération Ligues des Droits des Femmes', number: '080 100 47 47', available: '24/7' },
    ],
  },
  {
    country: 'Mozambique',
    code: 'MZ',
    emergency: '119',
    police: '119',
    domestic_violence: [{ name: 'Fórum Mulher', number: '+258 21 312 977' }],
  },
  {
    country: 'Myanmar',
    code: 'MM',
    emergency: '199',
    police: '199',
    domestic_violence: [{ name: 'Ministry of Social Welfare Hotline', number: '067-404-530' }],
  },
  {
    country: 'Nepal',
    code: 'NP',
    emergency: '100',
    police: '100',
    domestic_violence: [
      { name: 'National Women Commission', number: '1145', available: '24/7' },
    ],
    crisis: [{ name: 'Transcultural Psychosocial Organization', number: '1660-01-22292' }],
  },
  {
    country: 'Netherlands',
    code: 'NL',
    emergency: '112',
    police: '0900-8844',
    domestic_violence: [
      { name: 'Veilig Thuis', number: '0800 2000', available: '24/7', description: 'Free safe home helpline' },
    ],
    crisis: [{ name: 'SOS Telefonische Hulpdienst', number: '0900 0767', available: '24/7' }],
  },
  {
    country: 'New Zealand',
    code: 'NZ',
    emergency: '111',
    police: '111',
    domestic_violence: [
      { name: 'Family Violence Info Line', number: '0800 456 450', available: '24/7' },
      { name: 'Are You OK', number: '0800 456 450', available: '24/7' },
    ],
    sexual_assault: [
      { name: 'HELP Foundation', number: '09 623 1700', available: '24/7' },
    ],
    crisis: [{ name: 'Lifeline NZ', number: '0800 543 354', available: '24/7' }],
  },
  {
    country: 'Nicaragua',
    code: 'NI',
    emergency: '118',
    police: '118',
    domestic_violence: [{ name: 'Comisaría de la Mujer', number: '118' }],
  },
  {
    country: 'Nigeria',
    code: 'NG',
    emergency: '199',
    police: '199',
    domestic_violence: [
      { name: 'WARIF Helpline', number: '08000WARIF', description: 'Women at Risk International Foundation' },
      { name: 'Project Alert', number: '01-759-2848' },
    ],
    crisis: [{ name: 'Mentally Aware Nigeria Initiative', number: '08000842546', available: '24/7' }],
  },
  {
    country: 'Norway',
    code: 'NO',
    emergency: '112',
    police: '02800',
    domestic_violence: [
      { name: 'Krisetelefonen for vold i nære relasjoner', number: '116 006', available: '24/7' },
    ],
    crisis: [{ name: 'Mental Helse Hjelpetelefonen', number: '116 123', available: '24/7' }],
  },
  {
    country: 'Pakistan',
    code: 'PK',
    emergency: '15',
    police: '15',
    domestic_violence: [
      { name: 'Umang Helpline', number: '0317 4288665', available: '24/7' },
      { name: 'Rozan Counseling', number: '051-2890505' },
    ],
    crisis: [{ name: 'Umang Crisis Line', number: '0311-7786264', available: '24/7' }],
  },
  {
    country: 'Palestine',
    code: 'PS',
    emergency: '100',
    police: '100',
    domestic_violence: [{ name: 'WCLAC', number: '1800-500-111', available: '24/7' }],
  },
  {
    country: 'Peru',
    code: 'PE',
    emergency: '105',
    police: '105',
    domestic_violence: [
      { name: 'Línea 100 — Violencia Familiar', number: '100', available: '24/7', description: 'Free domestic violence line' },
    ],
    crisis: [{ name: 'APESEG Línea de Crisis', number: '0800-4-1212' }],
  },
  {
    country: 'Philippines',
    code: 'PH',
    emergency: '911',
    police: '117',
    domestic_violence: [
      { name: 'Philippine National Police WCPC', number: '02-8722-0650' },
      { name: 'DSWD Crisis Intervention', number: '931' },
    ],
    crisis: [{ name: 'In Touch Crisis Line', number: '02 8893-7603', available: '24/7' }],
  },
  {
    country: 'Poland',
    code: 'PL',
    emergency: '112',
    police: '997',
    domestic_violence: [
      { name: 'Ogólnopolskie Pogotowie dla Ofiar Przemocy', number: '116 123', available: '24/7' },
      { name: 'Niebieska Linia', number: '800-120-002', available: '24/7' },
    ],
  },
  {
    country: 'Portugal',
    code: 'PT',
    emergency: '112',
    police: '112',
    domestic_violence: [
      { name: 'APAV — Victim Support', number: '116 006', available: '24/7' },
    ],
    crisis: [{ name: 'SOS Voz Amiga', number: '213 544 545', available: '24/7' }],
  },
  {
    country: 'Romania',
    code: 'RO',
    emergency: '112',
    police: '112',
    domestic_violence: [
      { name: 'ANPIS Hotline', number: '0800 500 333', available: '24/7' },
    ],
  },
  {
    country: 'Russia',
    code: 'RU',
    emergency: '112',
    police: '102',
    domestic_violence: [
      { name: 'National Domestic Violence Hotline', number: '8-800-7000-600', available: '24/7', description: 'Free call' },
    ],
    crisis: [{ name: 'Telephone of Psychological Help', number: '8-800-2000-122', available: '24/7' }],
  },
  {
    country: 'Rwanda',
    code: 'RW',
    emergency: '112',
    police: '112',
    domestic_violence: [
      { name: 'Isange One Stop Centre', number: '3029', available: '24/7' },
    ],
  },
  {
    country: 'Saudi Arabia',
    code: 'SA',
    emergency: '911',
    police: '911',
    domestic_violence: [
      { name: 'Social Protection Program', number: '1919', available: '24/7' },
    ],
  },
  {
    country: 'Senegal',
    code: 'SN',
    emergency: '17',
    police: '17',
    domestic_violence: [{ name: 'ABDI Hotline', number: '+221 33 869 0000' }],
  },
  {
    country: 'Serbia',
    code: 'RS',
    emergency: '112',
    police: '192',
    domestic_violence: [
      { name: 'SOS Telefon za žene', number: '0800 100 007', available: '24/7' },
    ],
  },
  {
    country: 'Sierra Leone',
    code: 'SL',
    emergency: '999',
    police: '999',
    domestic_violence: [{ name: 'Rainbow Centre', number: '+232 22 222 000' }],
  },
  {
    country: 'Singapore',
    code: 'SG',
    emergency: '999',
    police: '999',
    domestic_violence: [
      { name: 'PAVE — Holistic Care for Families', number: '6555 0390' },
      { name: 'Care Corner Domestic Violence Helpline', number: '1800 353 5800' },
    ],
    crisis: [{ name: 'Samaritans of Singapore', number: '1-767', available: '24/7' }],
  },
  {
    country: 'Somalia',
    code: 'SO',
    emergency: '888',
    police: '888',
    domestic_violence: [{ name: 'UNFPA Somalia', number: '+252 612 000 000' }],
  },
  {
    country: 'South Africa',
    code: 'ZA',
    emergency: '10111',
    police: '10111',
    domestic_violence: [
      { name: 'Lifeline National Counselling Line', number: '0861 322 322', available: '24/7' },
      { name: 'Stop Gender Violence Helpline', number: '0800 428 428', available: '24/7' },
      { name: 'GBV Command Centre', number: '0800 428 428', available: '24/7' },
    ],
    sexual_assault: [{ name: 'Thuthuzela Care Centres', number: '10111', available: '24/7' }],
    crisis: [{ name: 'SADAG', number: '0800 456 789', available: '24/7' }],
  },
  {
    country: 'South Korea',
    code: 'KR',
    emergency: '112',
    police: '112',
    domestic_violence: [
      { name: 'Women\'s Emergency Helpline', number: '1366', available: '24/7' },
    ],
    crisis: [{ name: 'Hope Line', number: '1577-0199', available: '24/7' }],
  },
  {
    country: 'South Sudan',
    code: 'SS',
    emergency: '999',
    police: '999',
    domestic_violence: [{ name: 'UNMISS Gender Unit', number: '+211 912 108 206' }],
  },
  {
    country: 'Spain',
    code: 'ES',
    emergency: '112',
    police: '091',
    domestic_violence: [
      { name: 'Teléfono de Atención y Protección para Víctimas', number: '016', available: '24/7', description: 'Free national helpline, does not appear on phone bill' },
    ],
    crisis: [{ name: 'Teléfono de la Esperanza', number: '717 003 717', available: '24/7' }],
  },
  {
    country: 'Sri Lanka',
    code: 'LK',
    emergency: '119',
    police: '119',
    domestic_violence: [
      { name: 'Women in Need Hotline', number: '1938', available: '24/7' },
    ],
    crisis: [{ name: 'CCCline', number: '1333', available: '24/7' }],
  },
  {
    country: 'Sudan',
    code: 'SD',
    emergency: '999',
    police: '999',
    domestic_violence: [{ name: 'Sudan Women General Union', number: '+249 187 550 101' }],
  },
  {
    country: 'Sweden',
    code: 'SE',
    emergency: '112',
    police: '114 14',
    domestic_violence: [
      { name: 'Riksorganisationen för kvinnojourer', number: '020-50 50 50', available: '24/7' },
    ],
    crisis: [{ name: 'Mind Självmordslinjen', number: '90101', available: '24/7' }],
  },
  {
    country: 'Switzerland',
    code: 'CH',
    emergency: '112',
    police: '117',
    domestic_violence: [
      { name: 'Opferhilfe Schweiz', number: '0800 040 080', available: '24/7' },
    ],
    crisis: [{ name: 'Die Dargebotene Hand', number: '143', available: '24/7' }],
  },
  {
    country: 'Syria',
    code: 'SY',
    emergency: '110',
    police: '112',
    domestic_violence: [{ name: 'AISHA Organization', number: '+90 312 232 5563' }],
  },
  {
    country: 'Taiwan',
    code: 'TW',
    emergency: '110',
    police: '110',
    domestic_violence: [
      { name: 'Family Violence & Sexual Assault Hotline', number: '113', available: '24/7' },
    ],
    crisis: [{ name: 'Suicide Prevention Hotline', number: '1925', available: '24/7' }],
  },
  {
    country: 'Tanzania',
    code: 'TZ',
    emergency: '112',
    police: '112',
    domestic_violence: [{ name: 'TGNP Mtandao', number: '+255 22 277 5592' }],
  },
  {
    country: 'Thailand',
    code: 'TH',
    emergency: '191',
    police: '191',
    domestic_violence: [
      { name: 'OSCC — One Stop Crisis Center', number: '1300', available: '24/7' },
    ],
    crisis: [{ name: 'Samaritans of Thailand', number: '02 713 6793', available: '24/7' }],
  },
  {
    country: 'Tunisia',
    code: 'TN',
    emergency: '197',
    police: '197',
    domestic_violence: [
      { name: 'AÏCHA Association Helpline', number: '71 764 850' },
    ],
  },
  {
    country: 'Turkey',
    code: 'TR',
    emergency: '112',
    police: '155',
    domestic_violence: [
      { name: 'ALO 183 — Social Support Line', number: '183', available: '24/7', description: 'Free, handles violence against women' },
    ],
    crisis: [{ name: 'ÇÖZÜM MERKEZİ', number: '182', available: '24/7' }],
  },
  {
    country: 'Uganda',
    code: 'UG',
    emergency: '999',
    police: '999',
    domestic_violence: [
      { name: 'MIFUMI Helpline', number: '0800 111 110', available: '24/7' },
    ],
    crisis: [{ name: 'Kampala Samaritans', number: '+256 312 260 260' }],
  },
  {
    country: 'Ukraine',
    code: 'UA',
    emergency: '112',
    police: '102',
    domestic_violence: [
      { name: 'La Strada National Hotline', number: '0 800 500 335', available: '24/7', description: 'Free, including from mobile' },
    ],
    crisis: [{ name: 'Trust Hotline', number: '0 800 505 302', available: '24/7' }],
  },
  {
    country: 'United Kingdom',
    code: 'GB',
    emergency: '999',
    police: '101',
    domestic_violence: [
      { name: 'National Domestic Abuse Helpline', number: '0808 2000 247', available: '24/7', description: 'Freephone' },
      { name: 'Refuge', number: '0808 2000 247', available: '24/7' },
    ],
    sexual_assault: [
      { name: 'Rape Crisis England & Wales', number: '0808 802 9999', available: '24/7' },
    ],
    crisis: [{ name: 'Samaritans', number: '116 123', available: '24/7' }],
  },
  {
    country: 'United States',
    code: 'US',
    emergency: '911',
    police: '911',
    domestic_violence: [
      { name: 'National Domestic Violence Hotline', number: '1-800-799-7233', available: '24/7', sms: 'Text START to 88788', chat: 'thehotline.org' },
      { name: 'StrongHearts Native Helpline', number: '1-844-762-8483', available: '24/7' },
    ],
    sexual_assault: [
      { name: 'RAINN National Sexual Assault Hotline', number: '1-800-656-4673', available: '24/7', chat: 'online.rainn.org' },
    ],
    crisis: [{ name: 'National Crisis Line', number: '988', available: '24/7', sms: 'Text 988' }],
  },
  {
    country: 'Uruguay',
    code: 'UY',
    emergency: '911',
    police: '911',
    domestic_violence: [
      { name: 'Línea Mujer', number: '0800 4141', available: '24/7' },
    ],
  },
  {
    country: 'Venezuela',
    code: 'VE',
    emergency: '911',
    police: '911',
    domestic_violence: [{ name: 'INAMUJER', number: '0800-MUJERES' }],
  },
  {
    country: 'Vietnam',
    code: 'VN',
    emergency: '113',
    police: '113',
    domestic_violence: [
      { name: 'National Domestic Violence Hotline', number: '18001567', available: '24/7' },
    ],
    crisis: [{ name: 'Vietnam Befrienders', number: '+84 28 3930 5000' }],
  },
  {
    country: 'Yemen',
    code: 'YE',
    emergency: '194',
    police: '194',
    domestic_violence: [{ name: 'Sisters Arab Forum', number: '+967 1 207 434' }],
  },
  {
    country: 'Zambia',
    code: 'ZM',
    emergency: '999',
    police: '999',
    domestic_violence: [{ name: 'YWCA Zambia', number: '+260 211 224 155' }],
  },
  {
    country: 'Zimbabwe',
    code: 'ZW',
    emergency: '999',
    police: '999',
    domestic_violence: [
      { name: 'Musasa Project', number: '+263 4 752 993' },
    ],
    crisis: [{ name: 'Zimbabwe Lifeline', number: '+263 4 77 27 21', available: '24/7' }],
  },
];

export const hotlinesByCode = Object.fromEntries(hotlines.map((h) => [h.code, h]));
