(function () {
  "use strict";

  var TOOL_SLUG = "open-section-capacity-premium";
  var STORAGE_PREFIX = "engineering-tools-open-section-capacity-premium-v1";
  var DEFAULT_FAMILY = "Universal Beams";
  var DEFAULT_DESIGNATION = "150UB14.0 - Grade 300";
  var DEFAULT_INPUTS = {
    major: "10",
    minor: "0",
    shear: "8"
  };
  var STEEL_SECTIONS = [
    { Section: "Welded Beams - Grade 300", Designation: "1200WB455 - Grade 300", Phi_Mxx_kNm: 7110, Phi_Mxy_kNm: 1260, Phi_Vv_kN: 2900 },
    { Section: "Welded Beams - Grade 300", Designation: "1200WB423 - Grade 300", Phi_Mxx_kNm: 6510, Phi_Mxy_kNm: 1130, Phi_Vv_kN: 2900 },
    { Section: "Welded Beams - Grade 300", Designation: "1200WB392 - Grade 300", Phi_Mxx_kNm: 5910, Phi_Mxy_kNm: 1010, Phi_Vv_kN: 2900 },
    { Section: "Welded Beams - Grade 300", Designation: "1200WB342 - Grade 300", Phi_Mxx_kNm: 4980, Phi_Mxy_kNm: 646, Phi_Vv_kN: 2900 },
    { Section: "Welded Beams - Grade 300", Designation: "1200WB317 - Grade 300", Phi_Mxx_kNm: 4500, Phi_Mxy_kNm: 565, Phi_Vv_kN: 2900 },
    { Section: "Welded Beams - Grade 300", Designation: "1200WB278 - Grade 300", Phi_Mxx_kNm: 3790, Phi_Mxy_kNm: 387, Phi_Vv_kN: 2900 },
    { Section: "Welded Beams - Grade 300", Designation: "1200WB249 - Grade 300", Phi_Mxx_kNm: 3250, Phi_Mxy_kNm: 239, Phi_Vv_kN: 2900 },
    { Section: "Welded Beams - Grade 300", Designation: "1000WB322 - Grade 300", Phi_Mxx_kNm: 4130, Phi_Mxy_kNm: 646, Phi_Vv_kN: 2490 },
    { Section: "Welded Beams - Grade 300", Designation: "1000WB296 - Grade 300", Phi_Mxx_kNm: 3720, Phi_Mxy_kNm: 565, Phi_Vv_kN: 2490 },
    { Section: "Welded Beams - Grade 300", Designation: "1000WB258 - Grade 300", Phi_Mxx_kNm: 3100, Phi_Mxy_kNm: 387, Phi_Vv_kN: 2490 },
    { Section: "Welded Beams - Grade 300", Designation: "1000WB215 - Grade 300", Phi_Mxx_kNm: 2580, Phi_Mxy_kNm: 244, Phi_Vv_kN: 2490 },
    { Section: "Welded Beams - Grade 300", Designation: "900WB282 - Grade 300", Phi_Mxx_kNm: 3440, Phi_Mxy_kNm: 645, Phi_Vv_kN: 1730 },
    { Section: "Welded Beams - Grade 300", Designation: "900WB257 - Grade 300", Phi_Mxx_kNm: 3070, Phi_Mxy_kNm: 565, Phi_Vv_kN: 1730 },
    { Section: "Welded Beams - Grade 300", Designation: "900WB218 - Grade 300", Phi_Mxx_kNm: 2510, Phi_Mxy_kNm: 386, Phi_Vv_kN: 1730 },
    { Section: "Welded Beams - Grade 300", Designation: "900WB175 - Grade 300", Phi_Mxx_kNm: 2020, Phi_Mxy_kNm: 243, Phi_Vv_kN: 1730 },
    { Section: "Welded Beams - Grade 300", Designation: "800WB192 - Grade 300", Phi_Mxx_kNm: 2030, Phi_Mxy_kNm: 318, Phi_Vv_kN: 1190 },
    { Section: "Welded Beams - Grade 300", Designation: "800WB168 - Grade 300", Phi_Mxx_kNm: 1720, Phi_Mxy_kNm: 238, Phi_Vv_kN: 1190 },
    { Section: "Welded Beams - Grade 300", Designation: "800WB146 - Grade 300", Phi_Mxx_kNm: 1540, Phi_Mxy_kNm: 204, Phi_Vv_kN: 1190 },
    { Section: "Welded Beams - Grade 300", Designation: "800WB122 - Grade 300", Phi_Mxx_kNm: 1220, Phi_Mxy_kNm: 135, Phi_Vv_kN: 1190 },
    { Section: "Welded Beams - Grade 300", Designation: "700WB173 - Grade 300", Phi_Mxx_kNm: 1610, Phi_Mxy_kNm: 267, Phi_Vv_kN: 1100 },
    { Section: "Welded Beams - Grade 300", Designation: "700WB150 - Grade 300", Phi_Mxx_kNm: 1350, Phi_Mxy_kNm: 197, Phi_Vv_kN: 1100 },
    { Section: "Welded Beams - Grade 300", Designation: "700WB130 - Grade 300", Phi_Mxx_kNm: 1210, Phi_Mxy_kNm: 169, Phi_Vv_kN: 1100 },
    { Section: "Welded Beams - Grade 300", Designation: "700WB115 - Grade 300", Phi_Mxx_kNm: 1020, Phi_Mxy_kNm: 134, Phi_Vv_kN: 1100 },
    { Section: "Welded Columns - Grade 300", Designation: "500WC440 - Grade 300", Phi_Mxx_kNm: 2620, Phi_Mxy_kNm: 1260, Phi_Vv_kN: 2420 },
    { Section: "Welded Columns - Grade 300", Designation: "500WC414 - Grade 300", Phi_Mxx_kNm: 2540, Phi_Mxy_kNm: 1260, Phi_Vv_kN: 1940 },
    { Section: "Welded Columns - Grade 300", Designation: "500WC383 - Grade 300", Phi_Mxx_kNm: 2300, Phi_Mxy_kNm: 1140, Phi_Vv_kN: 1940 },
    { Section: "Welded Columns - Grade 300", Designation: "500WC340 - Grade 300", Phi_Mxx_kNm: 2260, Phi_Mxy_kNm: 1010, Phi_Vv_kN: 1700 },
    { Section: "Welded Columns - Grade 300", Designation: "500WC290 - Grade 300", Phi_Mxx_kNm: 1910, Phi_Mxy_kNm: 860, Phi_Vv_kN: 1460 },
    { Section: "Welded Columns - Grade 300", Designation: "500WC267 - Grade 300", Phi_Mxx_kNm: 1690, Phi_Mxy_kNm: 747, Phi_Vv_kN: 1460 },
    { Section: "Welded Columns - Grade 300", Designation: "500WC228 - Grade 300", Phi_Mxx_kNm: 1410, Phi_Mxy_kNm: 593, Phi_Vv_kN: 1460 },
    { Section: "Welded Columns - Grade 300", Designation: "400WC361 - Grade 300", Phi_Mxx_kNm: 1880, Phi_Mxy_kNm: 810, Phi_Vv_kN: 2120 },
    { Section: "Welded Columns - Grade 300", Designation: "400WC328 - Grade 300", Phi_Mxx_kNm: 1790, Phi_Mxy_kNm: 808, Phi_Vv_kN: 1480 },
    { Section: "Welded Columns - Grade 300", Designation: "400WC303 - Grade 300", Phi_Mxx_kNm: 1620, Phi_Mxy_kNm: 727, Phi_Vv_kN: 1480 },
    { Section: "Welded Columns - Grade 300", Designation: "400WC270 - Grade 300", Phi_Mxx_kNm: 1430, Phi_Mxy_kNm: 646, Phi_Vv_kN: 1320 },
    { Section: "Welded Columns - Grade 300", Designation: "400WC212 - Grade 300", Phi_Mxx_kNm: 1100, Phi_Mxy_kNm: 504, Phi_Vv_kN: 1130 },
    { Section: "Welded Columns - Grade 300", Designation: "400WC181 - Grade 300", Phi_Mxx_kNm: 922, Phi_Mxy_kNm: 408, Phi_Vv_kN: 1130 },
    { Section: "Welded Columns - Grade 300", Designation: "400WC144 - Grade 300", Phi_Mxx_kNm: 698, Phi_Mxy_kNm: 303, Phi_Vv_kN: 907 },
    { Section: "Welded Columns - Grade 300", Designation: "350WC280 - Grade 300", Phi_Mxx_kNm: 1240, Phi_Mxy_kNm: 618, Phi_Vv_kN: 1160 },
    { Section: "Welded Columns - Grade 300", Designation: "350WC258 - Grade 300", Phi_Mxx_kNm: 1120, Phi_Mxy_kNm: 557, Phi_Vv_kN: 1160 },
    { Section: "Welded Columns - Grade 300", Designation: "350WC230 - Grade 300", Phi_Mxx_kNm: 986, Phi_Mxy_kNm: 495, Phi_Vv_kN: 1040 },
    { Section: "Welded Columns - Grade 300", Designation: "350WC197 - Grade 300", Phi_Mxx_kNm: 844, Phi_Mxy_kNm: 433, Phi_Vv_kN: 891 },
    { Section: "Welded Beams - Grade 400", Designation: "1200WB455 - Grade 400", Phi_Mxx_kNm: 9090, Phi_Mxy_kNm: 1620, Phi_Vv_kN: 3320 },
    { Section: "Welded Beams - Grade 400", Designation: "1200WB423 - Grade 400", Phi_Mxx_kNm: 8320, Phi_Mxy_kNm: 1460, Phi_Vv_kN: 3320 },
    { Section: "Welded Beams - Grade 400", Designation: "1200WB392 - Grade 400", Phi_Mxx_kNm: 7550, Phi_Mxy_kNm: 1260, Phi_Vv_kN: 3320 },
    { Section: "Welded Beams - Grade 400", Designation: "1200WB342 - Grade 400", Phi_Mxx_kNm: 6360, Phi_Mxy_kNm: 830, Phi_Vv_kN: 3320 },
    { Section: "Welded Beams - Grade 400", Designation: "1200WB317 - Grade 400", Phi_Mxx_kNm: 5750, Phi_Mxy_kNm: 723, Phi_Vv_kN: 3320 },
    { Section: "Welded Beams - Grade 400", Designation: "1200WB278 - Grade 400", Phi_Mxx_kNm: 4830, Phi_Mxy_kNm: 497, Phi_Vv_kN: 3320 },
    { Section: "Welded Beams - Grade 400", Designation: "1200WB249 - Grade 400", Phi_Mxx_kNm: 4140, Phi_Mxy_kNm: 308, Phi_Vv_kN: 3320 },
    { Section: "Welded Beams - Grade 400", Designation: "1000WB322 - Grade 400", Phi_Mxx_kNm: 5310, Phi_Mxy_kNm: 830, Phi_Vv_kN: 3150 },
    { Section: "Welded Beams - Grade 400", Designation: "1000WB296 - Grade 400", Phi_Mxx_kNm: 4780, Phi_Mxy_kNm: 723, Phi_Vv_kN: 3150 },
    { Section: "Welded Beams - Grade 400", Designation: "1000WB258 - Grade 400", Phi_Mxx_kNm: 3990, Phi_Mxy_kNm: 497, Phi_Vv_kN: 3150 },
    { Section: "Welded Beams - Grade 400", Designation: "1000WB215 - Grade 400", Phi_Mxx_kNm: 3270, Phi_Mxy_kNm: 303, Phi_Vv_kN: 3150 },
    { Section: "Welded Beams - Grade 400", Designation: "900WB282 - Grade 400", Phi_Mxx_kNm: 4370, Phi_Mxy_kNm: 830, Phi_Vv_kN: 1820 },
    { Section: "Welded Beams - Grade 400", Designation: "900WB257 - Grade 400", Phi_Mxx_kNm: 3900, Phi_Mxy_kNm: 721, Phi_Vv_kN: 1820 },
    { Section: "Welded Beams - Grade 400", Designation: "900WB218 - Grade 400", Phi_Mxx_kNm: 3190, Phi_Mxy_kNm: 495, Phi_Vv_kN: 1820 },
    { Section: "Welded Beams - Grade 400", Designation: "900WB175 - Grade 400", Phi_Mxx_kNm: 2500, Phi_Mxy_kNm: 302, Phi_Vv_kN: 1820 },
    { Section: "Welded Beams - Grade 400", Designation: "800WB192 - Grade 400", Phi_Mxx_kNm: 2540, Phi_Mxy_kNm: 408, Phi_Vv_kN: 1190 },
    { Section: "Welded Beams - Grade 400", Designation: "800WB168 - Grade 400", Phi_Mxx_kNm: 2150, Phi_Mxy_kNm: 307, Phi_Vv_kN: 1190 },
    { Section: "Welded Beams - Grade 400", Designation: "800WB146 - Grade 400", Phi_Mxx_kNm: 1880, Phi_Mxy_kNm: 258, Phi_Vv_kN: 1190 },
    { Section: "Welded Beams - Grade 400", Designation: "800WB122 - Grade 400", Phi_Mxx_kNm: 1480, Phi_Mxy_kNm: 166, Phi_Vv_kN: 1190 },
    { Section: "Welded Beams - Grade 400", Designation: "700WB173 - Grade 400", Phi_Mxx_kNm: 2070, Phi_Mxy_kNm: 343, Phi_Vv_kN: 1380 },
    { Section: "Welded Beams - Grade 400", Designation: "700WB150 - Grade 400", Phi_Mxx_kNm: 1740, Phi_Mxy_kNm: 253, Phi_Vv_kN: 1380 },
    { Section: "Welded Beams - Grade 400", Designation: "700WB130 - Grade 400", Phi_Mxx_kNm: 1540, Phi_Mxy_kNm: 214, Phi_Vv_kN: 1380 },
    { Section: "Welded Beams - Grade 400", Designation: "700WB115 - Grade 400", Phi_Mxx_kNm: 1300, Phi_Mxy_kNm: 166, Phi_Vv_kN: 1380 },
    { Section: "Welded Columns - Grade 400", Designation: "500WC440 - Grade 400", Phi_Mxx_kNm: 3370, Phi_Mxy_kNm: 1620, Phi_Vv_kN: 3010 },
    { Section: "Welded Columns - Grade 400", Designation: "500WC414 - Grade 400", Phi_Mxx_kNm: 3270, Phi_Mxy_kNm: 1620, Phi_Vv_kN: 2490 },
    { Section: "Welded Columns - Grade 400", Designation: "500WC383 - Grade 400", Phi_Mxx_kNm: 2960, Phi_Mxy_kNm: 1460, Phi_Vv_kN: 2490 },
    { Section: "Welded Columns - Grade 400", Designation: "500WC340 - Grade 400", Phi_Mxx_kNm: 2860, Phi_Mxy_kNm: 1270, Phi_Vv_kN: 2190 },
    { Section: "Welded Columns - Grade 400", Designation: "500WC290 - Grade 400", Phi_Mxx_kNm: 2400, Phi_Mxy_kNm: 1070, Phi_Vv_kN: 1850 },
    { Section: "Welded Columns - Grade 400", Designation: "500WC267 - Grade 400", Phi_Mxx_kNm: 2120, Phi_Mxy_kNm: 928, Phi_Vv_kN: 1850 },
    { Section: "Welded Columns - Grade 400", Designation: "500WC228 - Grade 400", Phi_Mxx_kNm: 1660, Phi_Mxy_kNm: 717, Phi_Vv_kN: 1850 },
    { Section: "Welded Columns - Grade 400", Designation: "400WC361 - Grade 400", Phi_Mxx_kNm: 2420, Phi_Mxy_kNm: 1040, Phi_Vv_kN: 2690 },
    { Section: "Welded Columns - Grade 400", Designation: "400WC328 - Grade 400", Phi_Mxx_kNm: 2300, Phi_Mxy_kNm: 1040, Phi_Vv_kN: 1910 },
    { Section: "Welded Columns - Grade 400", Designation: "400WC303 - Grade 400", Phi_Mxx_kNm: 2080, Phi_Mxy_kNm: 935, Phi_Vv_kN: 1910 },
    { Section: "Welded Columns - Grade 400", Designation: "400WC270 - Grade 400", Phi_Mxx_kNm: 1830, Phi_Mxy_kNm: 831, Phi_Vv_kN: 1700 },
    { Section: "Welded Columns - Grade 400", Designation: "400WC212 - Grade 400", Phi_Mxx_kNm: 1380, Phi_Mxy_kNm: 631, Phi_Vv_kN: 1440 },
    { Section: "Welded Columns - Grade 400", Designation: "400WC181 - Grade 400", Phi_Mxx_kNm: 1140, Phi_Mxy_kNm: 499, Phi_Vv_kN: 1440 },
    { Section: "Welded Columns - Grade 400", Designation: "400WC144 - Grade 400", Phi_Mxx_kNm: 824, Phi_Mxy_kNm: 367, Phi_Vv_kN: 1150 },
    { Section: "Welded Columns - Grade 400", Designation: "350WC280 - Grade 400", Phi_Mxx_kNm: 1600, Phi_Mxy_kNm: 795, Phi_Vv_kN: 1500 },
    { Section: "Welded Columns - Grade 400", Designation: "350WC258 - Grade 400", Phi_Mxx_kNm: 1440, Phi_Mxy_kNm: 716, Phi_Vv_kN: 1500 },
    { Section: "Welded Columns - Grade 400", Designation: "350WC230 - Grade 400", Phi_Mxx_kNm: 1270, Phi_Mxy_kNm: 636, Phi_Vv_kN: 1340 },
    { Section: "Welded Columns - Grade 400", Designation: "350WC197 - Grade 400", Phi_Mxx_kNm: 1080, Phi_Mxy_kNm: 556, Phi_Vv_kN: 1130 },
    { Section: "Universal Beams", Designation: "610UB125 - Grade 300", Phi_Msx_kNm: 927, Phi_Msy_kNm: 130, Phi_Vv_kN: 1180 },
    { Section: "Universal Beams", Designation: "610UB113 - Grade 300", Phi_Msx_kNm: 829, Phi_Msy_kNm: 114, Phi_Vv_kN: 1100 },
    { Section: "Universal Beams", Designation: "610UB101 - Grade 300", Phi_Msx_kNm: 782, Phi_Msy_kNm: 104, Phi_Vv_kN: 1100 },
    { Section: "Universal Beams", Designation: "530UB92.4 - Grade 300", Phi_Msx_kNm: 640, Phi_Msy_kNm: 92.2, Phi_Vv_kN: 939 },
    { Section: "Universal Beams", Designation: "530UB82.0 - Grade 300", Phi_Msx_kNm: 558, Phi_Msy_kNm: 78, Phi_Vv_kN: 876 },
    { Section: "Universal Beams", Designation: "460UB82.1 - Grade 300", Phi_Msx_kNm: 496, Phi_Msy_kNm: 79, Phi_Vv_kN: 788 },
    { Section: "Universal Beams", Designation: "460UB74.6 - Grade 300", Phi_Msx_kNm: 449, Phi_Msy_kNm: 70.8, Phi_Vv_kN: 719 },
    { Section: "Universal Beams", Designation: "460UB67.1 - Grade 300", Phi_Msx_kNm: 399, Phi_Msy_kNm: 62, Phi_Vv_kN: 667 },
    { Section: "Universal Beams", Designation: "410UB59.7 - Grade 300", Phi_Msx_kNm: 324, Phi_Msy_kNm: 54.8, Phi_Vv_kN: 548 },
    { Section: "Universal Beams", Designation: "410UB53.7 - Grade 300", Phi_Msx_kNm: 304, Phi_Msy_kNm: 49.8, Phi_Vv_kN: 529 },
    { Section: "Universal Beams", Designation: "360UB56.7 - Grade 300", Phi_Msx_kNm: 273, Phi_Msy_kNm: 52, Phi_Vv_kN: 496 },
    { Section: "Universal Beams", Designation: "360UB50.7 - Grade 300", Phi_Msx_kNm: 242, Phi_Msy_kNm: 45.5, Phi_Vv_kN: 449 },
    { Section: "Universal Beams", Designation: "360UB44.7 - Grade 300", Phi_Msx_kNm: 222, Phi_Msy_kNm: 40.4, Phi_Vv_kN: 420 },
    { Section: "Universal Beams", Designation: "310UB46.2 - Grade 300", Phi_Msx_kNm: 197, Phi_Msy_kNm: 44, Phi_Vv_kN: 356 },
    { Section: "Universal Beams", Designation: "310UB40.4 - Grade 300", Phi_Msx_kNm: 182, Phi_Msy_kNm: 40, Phi_Vv_kN: 320 },
    { Section: "Universal Beams", Designation: "310UB32.0 - Grade 300", Phi_Msx_kNm: 134, Phi_Msy_kNm: 25, Phi_Vv_kN: 283 },
    { Section: "Universal Beams", Designation: "250UB37.3 - Grade 300", Phi_Msx_kNm: 140, Phi_Msy_kNm: 33.5, Phi_Vv_kN: 283 },
    { Section: "Universal Beams", Designation: "250UB31.4 - Grade 300", Phi_Msx_kNm: 114, Phi_Msy_kNm: 26.3, Phi_Vv_kN: 265 },
    { Section: "Universal Beams", Designation: "250UB25.7 - Grade 300", Phi_Msx_kNm: 92, Phi_Msy_kNm: 17.8, Phi_Vv_kN: 214 },
    { Section: "Universal Beams", Designation: "200UB29.8 - Grade 300", Phi_Msx_kNm: 90.9, Phi_Msy_kNm: 24.9, Phi_Vv_kN: 225 },
    { Section: "Universal Beams", Designation: "200UB25.4 - Grade 300", Phi_Msx_kNm: 74.6, Phi_Msy_kNm: 19.8, Phi_Vv_kN: 204 },
    { Section: "Universal Beams", Designation: "200UB22.3 - Grade 300", Phi_Msx_kNm: 65.3, Phi_Msy_kNm: 17.4, Phi_Vv_kN: 174 },
    { Section: "Universal Beams", Designation: "200UB18.2 - Grade 300", Phi_Msx_kNm: 51.8, Phi_Msy_kNm: 9.92, Phi_Vv_kN: 154 },
    { Section: "Universal Beams", Designation: "180UB22.2 - Grade 300", Phi_Msx_kNm: 56.2, Phi_Msy_kNm: 11.7, Phi_Vv_kN: 186 },
    { Section: "Universal Beams", Designation: "180UB18.1 - Grade 300", Phi_Msx_kNm: 45.2, Phi_Msy_kNm: 9.36, Phi_Vv_kN: 151 },
    { Section: "Universal Beams", Designation: "180UB16.1 - Grade 300", Phi_Msx_kNm: 39.8, Phi_Msy_kNm: 8.19, Phi_Vv_kN: 135 },
    { Section: "Universal Beams", Designation: "150UB18.0 - Grade 300", Phi_Msx_kNm: 38.9, Phi_Msy_kNm: 7.74, Phi_Vv_kN: 161 },
    { Section: "Universal Beams", Designation: "150UB14.0 - Grade 300", Phi_Msx_kNm: 29.3, Phi_Msy_kNm: 5.7, Phi_Vv_kN: 130 },
    { Section: "Universal Columns", Designation: "310UC158 - Grade 300", Phi_Msx_kNm: 676, Phi_Msy_kNm: 305, Phi_Vv_kN: 832 },
    { Section: "Universal Columns", Designation: "310UC137 - Grade 300", Phi_Msx_kNm: 580, Phi_Msy_kNm: 261, Phi_Vv_kN: 717 },
    { Section: "Universal Columns", Designation: "310UC118 - Grade 300", Phi_Msx_kNm: 494, Phi_Msy_kNm: 222, Phi_Vv_kN: 606 },
    { Section: "Universal Columns", Designation: "310UC96.8 - Grade 300", Phi_Msx_kNm: 422, Phi_Msy_kNm: 187, Phi_Vv_kN: 527 },
    { Section: "Universal Columns", Designation: "250UC89.5 - Grade 300", Phi_Msx_kNm: 309, Phi_Msy_kNm: 143, Phi_Vv_kN: 472 },
    { Section: "Universal Columns", Designation: "250UC72.9 - Grade 300", Phi_Msx_kNm: 266, Phi_Msy_kNm: 123, Phi_Vv_kN: 377 },
    { Section: "Universal Columns", Designation: "200UC59.5 - Grade 300", Phi_Msx_kNm: 177, Phi_Msy_kNm: 80.6, Phi_Vv_kN: 337 },
    { Section: "Universal Columns", Designation: "200UC52.2 - Grade 300", Phi_Msx_kNm: 154, Phi_Msy_kNm: 70.3, Phi_Vv_kN: 285 },
    { Section: "Universal Columns", Designation: "200UC46.2 - Grade 300", Phi_Msx_kNm: 133, Phi_Msy_kNm: 60.3, Phi_Vv_kN: 257 },
    { Section: "Universal Columns", Designation: "150UC37.2 - Grade 300", Phi_Msx_kNm: 83.6, Phi_Msy_kNm: 36.9, Phi_Vv_kN: 226 },
    { Section: "Universal Columns", Designation: "150UC30.0 - Grade 300", Phi_Msx_kNm: 71.9, Phi_Msy_kNm: 31.7, Phi_Vv_kN: 180 },
    { Section: "Universal Columns", Designation: "150UC23.4 - Grade 300", Phi_Msx_kNm: 50.7, Phi_Msy_kNm: 21.2, Phi_Vv_kN: 161 },
    { Section: "Universal Columns", Designation: "100UC14.8 - Grade 300", Phi_Msx_kNm: 21.4, Phi_Msy_kNm: 9.91, Phi_Vv_kN: 83.8 },
    { Section: "Tees Cut from Universal Beams", Designation: "30GBT62.5 - Grade 300", Phi_Msxf_kNm: 112, Phi_Msxs_kNm: 72.7, Phi_Vy_kN: 520 },
    { Section: "Tees Cut from Universal Beams", Designation: "30GBT56.5 - Grade 300", Phi_Msxf_kNm: 104, Phi_Msxs_kNm: 59.6, Phi_Vy_kN: 486 },
    { Section: "Tees Cut from Universal Beams", Designation: "30GBT50.5 - Grade 300", Phi_Msxf_kNm: 103, Phi_Msxs_kNm: 49.5, Phi_Vy_kN: 488 },
    { Section: "Tees Cut from Universal Beams", Designation: "265BT46.3 - Grade 300", Phi_Msxf_kNm: 78.3, Phi_Msxs_kNm: 45.3, Phi_Vy_kN: 414 },
    { Section: "Tees Cut from Universal Beams", Designation: "265BT41.0 - Grade 300", Phi_Msxf_kNm: 72.1, Phi_Msxs_kNm: 37, Phi_Vy_kN: 387 },
    { Section: "Tees Cut from Universal Beams", Designation: "230BT41.1 - Grade 300", Phi_Msxf_kNm: 56.8, Phi_Msxs_kNm: 39.5, Phi_Vy_kN: 346 },
    { Section: "Tees Cut from Universal Beams", Designation: "230BT37.3 - Grade 300", Phi_Msxf_kNm: 51.8, Phi_Msxs_kNm: 32.7, Phi_Vy_kN: 316 },
    { Section: "Tees Cut from Universal Beams", Designation: "230BT33.6 - Grade 300", Phi_Msxf_kNm: 47.6, Phi_Msxs_kNm: 26.3, Phi_Vy_kN: 293 },
    { Section: "Tees Cut from Universal Beams", Designation: "205BT29.9 - Grade 300", Phi_Msxf_kNm: 35.3, Phi_Msxs_kNm: 20.8, Phi_Vy_kN: 240 },
    { Section: "Tees Cut from Universal Beams", Designation: "205BT26.9 - Grade 300", Phi_Msxf_kNm: 35.8, Phi_Msxs_kNm: 18.8, Phi_Vy_kN: 232 },
    { Section: "Tees Cut from Universal Beams", Designation: "180BT28.4 - Grade 300", Phi_Msxf_kNm: 28.2, Phi_Msxs_kNm: 20.2, Phi_Vy_kN: 217 },
    { Section: "Tees Cut from Universal Beams", Designation: "180BT25.4 - Grade 300", Phi_Msxf_kNm: 25.4, Phi_Msxs_kNm: 17, Phi_Vy_kN: 196 },
    { Section: "Tees Cut from Universal Beams", Designation: "180BT22.4 - Grade 300", Phi_Msxf_kNm: 24.4, Phi_Msxs_kNm: 14.2, Phi_Vy_kN: 184 },
    { Section: "Tees Cut from Universal Beams", Designation: "155BT23.1 - Grade 300", Phi_Msxf_kNm: 17.6, Phi_Msxs_kNm: 12.4, Phi_Vy_kN: 154 },
    { Section: "Tees Cut from Universal Beams", Designation: "155BT20.2 - Grade 300", Phi_Msxf_kNm: 16.8, Phi_Msxs_kNm: 10.2, Phi_Vy_kN: 139 },
    { Section: "Tees Cut from Universal Beams", Designation: "155BT16.0 - Grade 300", Phi_Msxf_kNm: 13.6, Phi_Msxs_kNm: 7.23, Phi_Vy_kN: 123 },
    { Section: "Tees Cut from Universal Beams", Designation: "125BT18.7 - Grade 300", Phi_Msxf_kNm: 12.3, Phi_Msxs_kNm: 9.38, Phi_Vy_kN: 123 },
    { Section: "Tees Cut from Universal Beams", Designation: "125BT15.7 - Grade 300", Phi_Msxf_kNm: 11.2, Phi_Msxs_kNm: 8.37, Phi_Vy_kN: 115 },
    { Section: "Tees Cut from Universal Beams", Designation: "125BT12.9 - Grade 300", Phi_Msxf_kNm: 9.03, Phi_Msxs_kNm: 5.56, Phi_Vy_kN: 92.5 },
    { Section: "Tees Cut from Universal Beams", Designation: "100BT14.9 - Grade 300", Phi_Msxf_kNm: 7.86, Phi_Msxs_kNm: 6.6, Phi_Vy_kN: 97.4 },
    { Section: "Tees Cut from Universal Beams", Designation: "100BT12.7 - Grade 300", Phi_Msxf_kNm: 6.92, Phi_Msxs_kNm: 5.67, Phi_Vy_kN: 88.2 },
    { Section: "Tees Cut from Universal Beams", Designation: "100BT11.2 - Grade 300", Phi_Msxf_kNm: 5.62, Phi_Msxs_kNm: 4.5, Phi_Vy_kN: 75.2 },
    { Section: "Tees Cut from Universal Beams", Designation: "90BT11.1 - Grade 300", Phi_Msxf_kNm: 5.4, Phi_Msxs_kNm: 4.75, Phi_Vy_kN: 80.4 },
    { Section: "Tees Cut from Universal Beams", Designation: "90BT9.1 - Grade 300", Phi_Msxf_kNm: 4.37, Phi_Msxs_kNm: 3.57, Phi_Vy_kN: 65.3 },
    { Section: "Tees Cut from Universal Beams", Designation: "90BT8.1 - Grade 300", Phi_Msxf_kNm: 3.87, Phi_Msxs_kNm: 3.01, Phi_Vy_kN: 58 },
    { Section: "Tees Cut from Universal Beams", Designation: "75BT9.0 - Grade 300", Phi_Msxf_kNm: 3.96, Phi_Msxs_kNm: 3.66, Phi_Vy_kN: 69.7 },
    { Section: "Tees Cut from Universal Beams", Designation: "75BT7.0 - Grade 300", Phi_Msxf_kNm: 3.14, Phi_Msxs_kNm: 2.73, Phi_Vy_kN: 56.2 },
    { Section: "Tees Cut from Universal Columns", Designation: "155CT79.0 - Grade 300", Phi_Msyf_kNm: 42.7, Phi_Msys_kNm: 42.5, Phi_Msx_kNm: 152, Phi_Vv_kN: 357 },
    { Section: "Tees Cut from Universal Columns", Designation: "155CT68.5 - Grade 300", Phi_Msyf_kNm: 36.5, Phi_Msys_kNm: 35.3, Phi_Msx_kNm: 131, Phi_Vv_kN: 308 },
    { Section: "Tees Cut from Universal Columns", Designation: "155CT59.0 - Grade 300", Phi_Msyf_kNm: 30.7, Phi_Msys_kNm: 28.6, Phi_Msx_kNm: 111, Phi_Vv_kN: 260 },
    { Section: "Tees Cut from Universal Columns", Designation: "155CT48.4 - Grade 300", Phi_Msyf_kNm: 24.7, Phi_Msys_kNm: 23.1, Phi_Msx_kNm: 93.7, Phi_Vv_kN: 226 },
    { Section: "Tees Cut from Universal Columns", Designation: "125CT44.8 - Grade 300", Phi_Msyf_kNm: 18.3, Phi_Msys_kNm: 17.5, Phi_Msx_kNm: 71.5, Phi_Vv_kN: 202 },
    { Section: "Tees Cut from Universal Columns", Designation: "125CT36.5 - Grade 300", Phi_Msyf_kNm: 15.2, Phi_Msys_kNm: 13.9, Phi_Msx_kNm: 61.3, Phi_Vv_kN: 161 },
    { Section: "Tees Cut from Universal Columns", Designation: "100CT29.8 - Grade 300", Phi_Msyf_kNm: 11.2, Phi_Msys_kNm: 10.8, Phi_Msx_kNm: 40.3, Phi_Vv_kN: 144 },
    { Section: "Tees Cut from Universal Columns", Designation: "100CT26.1 - Grade 300", Phi_Msyf_kNm: 9.44, Phi_Msys_kNm: 8.79, Phi_Msx_kNm: 35.1, Phi_Vv_kN: 122 },
    { Section: "Tees Cut from Universal Columns", Designation: "100CT23.1 - Grade 300", Phi_Msyf_kNm: 8.13, Phi_Msys_kNm: 7.64, Phi_Msx_kNm: 30.1, Phi_Vv_kN: 110 },
    { Section: "Tees Cut from Universal Columns", Designation: "75CT18.6 - Grade 300", Phi_Msyf_kNm: 5.69, Phi_Msys_kNm: 5.66, Phi_Msx_kNm: 18.4, Phi_Vv_kN: 96.9 },
    { Section: "Tees Cut from Universal Columns", Designation: "75CT15.0 - Grade 300", Phi_Msyf_kNm: 4.78, Phi_Msys_kNm: 4.51, Phi_Msx_kNm: 15.9, Phi_Vv_kN: 76.8 },
    { Section: "Tees Cut from Universal Columns", Designation: "75CT11.7 - Grade 300", Phi_Msyf_kNm: 3.53, Phi_Msys_kNm: 3.84, Phi_Msx_kNm: 10.6, Phi_Vv_kN: 68.9 },
    { Section: "Tees Cut from Universal Columns", Designation: "50CT7.4 - Grade 300", Phi_Msyf_kNm: 1.33, Phi_Msys_kNm: 1.32, Phi_Msx_kNm: 4.95, Phi_Vv_kN: 35.4 },
    { Section: "Parallel Flange Channels", Designation: "380 PFC - Grade 300", Phi_Msx_kNm: 238, Phi_MsyR_kNm: 33.8, Phi_MsyL_kNm: 28.9, Phi_Vv_kN: 657 },
    { Section: "Parallel Flange Channels", Designation: "300 PFC - Grade 300", Phi_Msx_kNm: 152, Phi_MsyR_kNm: 26.1, Phi_MsyL_kNm: 22.2, Phi_Vv_kN: 415 },
    { Section: "Parallel Flange Channels", Designation: "250 PFC - Grade 300", Phi_Msx_kNm: 114, Phi_MsyR_kNm: 24, Phi_MsyL_kNm: 24, Phi_Vv_kN: 346 },
    { Section: "Parallel Flange Channels", Designation: "230 PFC - Grade 300", Phi_Msx_kNm: 73.3, Phi_MsyR_kNm: 13.6, Phi_MsyL_kNm: 12.2, Phi_Vv_kN: 258 },
    { Section: "Parallel Flange Channels", Designation: "200 PFC - Grade 300", Phi_Msx_kNm: 59.7, Phi_MsyR_kNm: 13.2, Phi_MsyL_kNm: 12.6, Phi_Vv_kN: 207 },
    { Section: "Parallel Flange Channels", Designation: "180 PFC - Grade 300", Phi_Msx_kNm: 49, Phi_MsyR_kNm: 12.1, Phi_MsyL_kNm: 12.1, Phi_Vv_kN: 187 },
    { Section: "Parallel Flange Channels", Designation: "150 PFC - Grade 300", Phi_Msx_kNm: 37, Phi_MsyR_kNm: 11.1, Phi_MsyL_kNm: 11.1, Phi_Vv_kN: 156 },
    { Section: "Parallel Flange Channels", Designation: "125 PFC - Grade 300", Phi_Msx_kNm: 21, Phi_MsyR_kNm: 6.56, Phi_MsyL_kNm: 6.58, Phi_Vv_kN: 102 },
    { Section: "Parallel Flange Channels", Designation: "100 PFC - Grade 300", Phi_Msx_kNm: 11.6, Phi_MsyR_kNm: 3.46, Phi_MsyL_kNm: 3.46, Phi_Vv_kN: 72.6 },
    { Section: "Parallel Flange Channels", Designation: "75 PFC - Grade 300", Phi_Msx_kNm: 6.16, Phi_MsyR_kNm: 1.97, Phi_MsyL_kNm: 1.97, Phi_Vv_kN: 49.2 },
    { Section: "Taper Flange Beams", Designation: "125 TFB - Grade 300", Phi_Msx_kNm: 23.1, Phi_Msy_kNm: 4.48, Phi_Vv_kN: 108 },
    { Section: "Taper Flange Beams", Designation: "100 TFB - Grade 300", Phi_Msx_kNm: 9.82, Phi_Msy_kNm: 1.53, Phi_Vv_kN: 69.1 }
  ];

  function getUtils() {
    return window.EngineeringTools && window.EngineeringTools.utils ? window.EngineeringTools.utils : null;
  }

  function parseNumber(value) {
    var trimmed = String(value === undefined || value === null ? "" : value).trim();
    if (trimmed === "") {
      return null;
    }
    var utils = getUtils();
    if (utils && typeof utils.parseNumber === "function") {
      var parsedUtility = utils.parseNumber(trimmed, null);
      return Number.isFinite(parsedUtility) ? parsedUtility : null;
    }
    var parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function formatNumber(value, decimals) {
    var utils = getUtils();
    if (utils && typeof utils.formatNumber === "function") {
      return utils.formatNumber(value, decimals);
    }
    return new Intl.NumberFormat("en-AU", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function buildGridLines(width, height, spacing) {
    var lines = [];
    var x;
    var y;
    for (x = 0; x <= width; x += spacing) {
      lines.push('<line class="et-oscp__svg-grid" x1="' + x + '" y1="0" x2="' + x + '" y2="' + height + '"></line>');
    }
    for (y = 0; y <= height; y += spacing) {
      lines.push('<line class="et-oscp__svg-grid" x1="0" y1="' + y + '" x2="' + width + '" y2="' + y + '"></line>');
    }
    return lines.join("");
  }

  function formatDateTime(value) {
    return new Date(value).toLocaleString("en-AU", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  }

  function readStorage(key) {
    try {
      var raw = window.localStorage.getItem(key);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function writeStorage(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value.slice(0, 20)));
    } catch (error) {
      // Ignore storage failures.
    }
  }

  function getAxisAccent(axisId) {
    if (axisId === "minor") {
      return "#10979a";
    }
    if (axisId === "shear") {
      return "#c57d16";
    }
    return "#2563eb";
  }

  function createOption(id, label, symbolTex, value, unit) {
    return {
      id: id,
      label: label,
      symbolTex: symbolTex,
      value: value,
      unit: unit
    };
  }

  function createAxis(id, demandLabel, demandSymbolTex, unit, description, options) {
    return options.length ? {
      id: id,
      demandLabel: demandLabel,
      demandSymbolTex: demandSymbolTex,
      unit: unit,
      description: description,
      options: options
    } : null;
  }

  function parseDesignationMetrics(designation, sectionType) {
    var matches = designation.match(/\d+(\.\d+)?/g) || [];
    var numbers = matches.map(function (entry) {
      return Number(entry);
    });
    var nominalDepth = numbers[0] || 300;
    var nominalMass = numbers[1] || Math.max(20, nominalDepth / 6);
    var family = "i-section";
    var flangeWidthRatio = 0.45;
    var webThicknessRatio = 0.075;
    var flangeThicknessRatio = 0.11;
    var centroidShiftRatio = 0;

    if (sectionType.indexOf("Channels") !== -1) {
      family = "channel";
      flangeWidthRatio = 0.38;
      webThicknessRatio = 0.11;
      flangeThicknessRatio = 0.12;
      centroidShiftRatio = 0.14;
    }

    if (sectionType.indexOf("Tees") !== -1) {
      family = "tee";
      flangeWidthRatio = 0.56;
      webThicknessRatio = 0.1;
      flangeThicknessRatio = 0.14;
    }

    if (sectionType.indexOf("Columns") !== -1) {
      flangeWidthRatio = 0.62;
      webThicknessRatio = 0.11;
      flangeThicknessRatio = 0.135;
    }

    if (sectionType.indexOf("Welded Beams") !== -1) {
      flangeWidthRatio = 0.48;
      webThicknessRatio = 0.07;
    }

    return {
      family: family,
      depthMm: nominalDepth,
      flangeWidthMm: nominalDepth * (flangeWidthRatio + Math.min(0.18, nominalMass / 1000)),
      webThicknessRatio: webThicknessRatio,
      flangeThicknessRatio: flangeThicknessRatio,
      centroidShiftRatio: centroidShiftRatio
    };
  }

  function normalizeSection(raw) {
    var majorOptions = [];
    var minorOptions = [];
    var shearOptions = [];

    if (raw.Phi_Mxx_kNm !== undefined) {
      majorOptions.push(createOption("major-standard", "Strong axis", "\\phi M_{xx}", raw.Phi_Mxx_kNm, "kNm"));
    }
    if (raw.Phi_Msx_kNm !== undefined) {
      majorOptions.push(createOption("major-standard", "Major axis", "\\phi M_{sx}", raw.Phi_Msx_kNm, "kNm"));
    }
    if (raw.Phi_Msxf_kNm !== undefined) {
      majorOptions.push(createOption("major-flange", "Flange in compression", "\\phi M_{sxf}", raw.Phi_Msxf_kNm, "kNm"));
    }
    if (raw.Phi_Msxs_kNm !== undefined) {
      majorOptions.push(createOption("major-stem", "Stem in compression", "\\phi M_{sxs}", raw.Phi_Msxs_kNm, "kNm"));
    }

    if (raw.Phi_Mxy_kNm !== undefined) {
      minorOptions.push(createOption("minor-standard", "Weak axis", "\\phi M_{xy}", raw.Phi_Mxy_kNm, "kNm"));
    }
    if (raw.Phi_Msy_kNm !== undefined) {
      minorOptions.push(createOption("minor-standard", "Minor axis", "\\phi M_{sy}", raw.Phi_Msy_kNm, "kNm"));
    }
    if (raw.Phi_Msyf_kNm !== undefined) {
      minorOptions.push(createOption("minor-flange", "Flange in compression", "\\phi M_{syf}", raw.Phi_Msyf_kNm, "kNm"));
    }
    if (raw.Phi_Msys_kNm !== undefined) {
      minorOptions.push(createOption("minor-stem", "Stem in compression", "\\phi M_{sys}", raw.Phi_Msys_kNm, "kNm"));
    }
    if (raw.Phi_MsyR_kNm !== undefined) {
      minorOptions.push(createOption("minor-right", "Right flange leading", "\\phi M_{sy,R}", raw.Phi_MsyR_kNm, "kNm"));
    }
    if (raw.Phi_MsyL_kNm !== undefined) {
      minorOptions.push(createOption("minor-left", "Left flange leading", "\\phi M_{sy,L}", raw.Phi_MsyL_kNm, "kNm"));
    }

    if (raw.Phi_Vv_kN !== undefined) {
      shearOptions.push(createOption("shear-standard", "Web shear", "\\phi V_v", raw.Phi_Vv_kN, "kN"));
    }
    if (raw.Phi_Vy_kN !== undefined) {
      shearOptions.push(createOption("shear-standard", "Stem shear", "\\phi V_y", raw.Phi_Vy_kN, "kN"));
    }

    var diagram = parseDesignationMetrics(raw.Designation, raw.Section);
    var gradeMatch = raw.Designation.match(/Grade\s+\d+/i);

    return {
      id: raw.Section + "-" + raw.Designation,
      sectionType: raw.Section,
      designation: raw.Designation,
      grade: gradeMatch ? gradeMatch[0] : "Grade 300/400",
      family: diagram.family,
      majorAxis: createAxis("major", "Applied major-axis moment", "M_x^*", "kNm", "Bending about the principal strong axis.", majorOptions),
      minorAxis: createAxis("minor", "Applied minor-axis moment", "M_y^*", "kNm", "Bending about the principal weak axis or orientation-dependent edge.", minorOptions),
      shearAxis: createAxis("shear", "Applied design shear", "V^*", "kN", "Design shear compared with the tabulated section shear resistance.", shearOptions),
      diagram: diagram,
      raw: raw
    };
  }

  function parseDemand(value, label, maxRecommended) {
    if (String(value).trim() === "") {
      return { error: label + " is required." };
    }
    var parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return { error: label + " must be numeric." };
    }
    if (parsed < 0) {
      return { error: label + " must be zero or greater." };
    }
    if (parsed > maxRecommended) {
      return { error: label + " exceeds the recommended range for this section. Check the units." };
    }
    return { value: parsed };
  }

  function validateDemands(section, inputs) {
    var errors = {};
    var values = {};

    if (!section) {
      return { errors: errors, values: values };
    }

    var majorCapacity = section.majorAxis ? Math.max.apply(null, section.majorAxis.options.map(function (entry) { return entry.value; })) : 0;
    var minorCapacity = section.minorAxis ? Math.max.apply(null, section.minorAxis.options.map(function (entry) { return entry.value; })) : 0;
    var shearCapacity = Math.max.apply(null, section.shearAxis.options.map(function (entry) { return entry.value; }));

    if (section.majorAxis) {
      var majorParsed = parseDemand(inputs.major, section.majorAxis.demandLabel, Math.max(majorCapacity * 5, 1));
      if (majorParsed.error) {
        errors.major = majorParsed.error;
      } else {
        values.major = majorParsed.value;
      }
    }

    if (section.minorAxis) {
      var minorParsed = parseDemand(inputs.minor, section.minorAxis.demandLabel, Math.max(minorCapacity * 5, 1));
      if (minorParsed.error) {
        errors.minor = minorParsed.error;
      } else {
        values.minor = minorParsed.value;
      }
    }

    var shearParsed = parseDemand(inputs.shear, section.shearAxis.demandLabel, Math.max(shearCapacity * 5, 1));
    if (shearParsed.error) {
      errors.shear = shearParsed.error;
    } else {
      values.shear = shearParsed.value;
    }

    return { errors: errors, values: values };
  }

  function calculateUtilization(section, inputs, selectedCases) {
    var validation = validateDemands(section, inputs);
    if (Object.keys(validation.errors).length > 0) {
      return null;
    }

    var checks = [];
    if (section.majorAxis && validation.values.major !== undefined) {
      var majorOption = section.majorAxis.options.find(function (entry) {
        return entry.id === selectedCases.majorCaseId;
      }) || section.majorAxis.options[0];
      checks.push({
        axisId: "major",
        label: majorOption.label,
        demandLabel: section.majorAxis.demandLabel,
        demandSymbolTex: section.majorAxis.demandSymbolTex,
        capacitySymbolTex: majorOption.symbolTex,
        demand: validation.values.major,
        capacity: majorOption.value,
        unit: majorOption.unit,
        utilization: validation.values.major / majorOption.value
      });
    }

    if (section.minorAxis && validation.values.minor !== undefined) {
      var minorOption = section.minorAxis.options.find(function (entry) {
        return entry.id === selectedCases.minorCaseId;
      }) || section.minorAxis.options[0];
      checks.push({
        axisId: "minor",
        label: minorOption.label,
        demandLabel: section.minorAxis.demandLabel,
        demandSymbolTex: section.minorAxis.demandSymbolTex,
        capacitySymbolTex: minorOption.symbolTex,
        demand: validation.values.minor,
        capacity: minorOption.value,
        unit: minorOption.unit,
        utilization: validation.values.minor / minorOption.value
      });
    }

    if (validation.values.shear !== undefined) {
      var shearOption = section.shearAxis.options[0];
      checks.push({
        axisId: "shear",
        label: shearOption.label,
        demandLabel: section.shearAxis.demandLabel,
        demandSymbolTex: section.shearAxis.demandSymbolTex,
        capacitySymbolTex: shearOption.symbolTex,
        demand: validation.values.shear,
        capacity: shearOption.value,
        unit: shearOption.unit,
        utilization: validation.values.shear / shearOption.value
      });
    }

    if (!checks.length) {
      return null;
    }

    var governingCheck = checks.reduce(function (currentMax, check) {
      return check.utilization > currentMax.utilization ? check : currentMax;
    });

    return {
      checks: checks,
      governingCheck: governingCheck,
      governingUtilization: governingCheck.utilization,
      status: governingCheck.utilization <= 1 ? "PASS" : "FAIL",
      reserveFactor: governingCheck.utilization > 0 ? 1 / governingCheck.utilization : Infinity
    };
  }

  function OpenSectionCapacityPremium(root, index) {
    this.root = root;
    this.index = index;
    this.storageKey = STORAGE_PREFIX + "::" + window.location.pathname + "::" + index;
    this.fields = {};
    this.outputs = {};
    this.actions = {};
    this.savedResults = readStorage(this.storageKey);
    this.sections = STEEL_SECTIONS.map(normalizeSection);
    this.sectionsByFamily = this.groupSectionsByFamily(this.sections);
    this.lastState = null;
    this.isExporting = false;
  }

  OpenSectionCapacityPremium.prototype.groupSectionsByFamily = function (sections) {
    return sections.reduce(function (accumulator, section) {
      if (!accumulator[section.sectionType]) {
        accumulator[section.sectionType] = [];
      }
      accumulator[section.sectionType].push(section);
      return accumulator;
    }, {});
  };

  OpenSectionCapacityPremium.prototype.init = function () {
    this.captureNodes();
    this.populateFamilies();
    this.bindEvents();
    this.resetForm();
    this.renderSavedResults();
    this.renderEquationPlaceholders();
    this.drawEmptyDiagram();
    this.update();
  };

  OpenSectionCapacityPremium.prototype.captureNodes = function () {
    var self = this;

    this.root.querySelectorAll("[data-field]").forEach(function (node) {
      self.fields[node.getAttribute("data-field")] = node;
    });

    this.root.querySelectorAll("[data-output]").forEach(function (node) {
      self.outputs[node.getAttribute("data-output")] = node;
    });

    this.root.querySelectorAll("[data-action]").forEach(function (node) {
      self.actions[node.getAttribute("data-action")] = node;
    });

    this.diagram = this.root.querySelector('[data-role="diagram"]');
    this.checksList = this.root.querySelector('[data-role="checks-list"]');
    this.savedResultsBody = this.root.querySelector('[data-role="saved-results"]');
    this.heroCard = this.root.querySelector('[data-role="hero-card"]');
    this.equationPrimary = this.root.querySelector('[data-role="equation-primary"]');
    this.equationSecondary = this.root.querySelector('[data-role="equation-secondary"]');
  };

  OpenSectionCapacityPremium.prototype.populateFamilies = function () {
    var familySelect = this.fields["section-family"];
    familySelect.innerHTML = Object.keys(this.sectionsByFamily).sort(function (a, b) {
      return a.localeCompare(b);
    }).map(function (family) {
      return '<option value="' + escapeHtml(family) + '">' + escapeHtml(family) + "</option>";
    }).join("");
  };

  OpenSectionCapacityPremium.prototype.populateDesignations = function (family, preserveDesignation) {
    var designationSelect = this.fields.designation;
    var entries = this.sectionsByFamily[family] || [];
    var previousValue = preserveDesignation ? designationSelect.value : "";
    designationSelect.innerHTML = entries.map(function (section) {
      return '<option value="' + escapeHtml(section.designation) + '">' + escapeHtml(section.designation) + "</option>";
    }).join("");

    if (preserveDesignation && previousValue && entries.some(function (section) { return section.designation === previousValue; })) {
      designationSelect.value = previousValue;
      return;
    }

    if (family === DEFAULT_FAMILY && entries.some(function (section) { return section.designation === DEFAULT_DESIGNATION; })) {
      designationSelect.value = DEFAULT_DESIGNATION;
      return;
    }

    if (entries.length) {
      designationSelect.value = entries[0].designation;
    }
  };

  OpenSectionCapacityPremium.prototype.populateCases = function (section, preserveExisting) {
    var majorSelect = this.fields["major-case"];
    var minorSelect = this.fields["minor-case"];
    var previousMajor = preserveExisting ? majorSelect.value : "";
    var previousMinor = preserveExisting ? minorSelect.value : "";

    majorSelect.innerHTML = section && section.majorAxis ? section.majorAxis.options.map(function (option) {
      return '<option value="' + escapeHtml(option.id) + '">' + escapeHtml(option.label + " - " + formatNumber(option.value, 2) + " " + option.unit) + "</option>";
    }).join("") : '<option value="">Not applicable</option>';

    minorSelect.innerHTML = section && section.minorAxis ? section.minorAxis.options.map(function (option) {
      return '<option value="' + escapeHtml(option.id) + '">' + escapeHtml(option.label + " - " + formatNumber(option.value, 2) + " " + option.unit) + "</option>";
    }).join("") : '<option value="">Not applicable</option>';

    if (section && section.majorAxis && previousMajor && section.majorAxis.options.some(function (option) { return option.id === previousMajor; })) {
      majorSelect.value = previousMajor;
    }

    if (section && section.minorAxis && previousMinor && section.minorAxis.options.some(function (option) { return option.id === previousMinor; })) {
      minorSelect.value = previousMinor;
    }
  };

  OpenSectionCapacityPremium.prototype.bindEvents = function () {
    var self = this;

    this.fields["section-family"].addEventListener("change", function () {
      self.populateDesignations(self.fields["section-family"].value, false);
      self.update();
    });

    this.fields.designation.addEventListener("change", function () {
      self.update();
    });

    ["major", "minor", "shear", "major-case", "minor-case"].forEach(function (fieldName) {
      if (!self.fields[fieldName]) {
        return;
      }
      self.fields[fieldName].addEventListener("input", function () {
        self.update();
      });
      self.fields[fieldName].addEventListener("change", function () {
        self.update();
      });
    });

    if (this.actions["save-result"]) {
      this.actions["save-result"].addEventListener("click", function () {
        self.saveCurrentResult();
      });
    }

    if (this.actions["reset-form"]) {
      this.actions["reset-form"].addEventListener("click", function () {
        self.resetForm();
      });
    }

    if (this.actions["clear-results"]) {
      this.actions["clear-results"].addEventListener("click", function () {
        self.savedResults = [];
        writeStorage(self.storageKey, self.savedResults);
        self.renderSavedResults();
      });
    }

    if (this.actions["export-word-report"]) {
      this.actions["export-word-report"].addEventListener("click", function () {
        self.exportWordReport();
      });
    }
  };

  OpenSectionCapacityPremium.prototype.resetForm = function () {
    this.fields["section-family"].value = DEFAULT_FAMILY;
    this.populateDesignations(DEFAULT_FAMILY, false);
    this.fields.major.value = DEFAULT_INPUTS.major;
    this.fields.minor.value = DEFAULT_INPUTS.minor;
    this.fields.shear.value = DEFAULT_INPUTS.shear;
    this.update();
  };

  OpenSectionCapacityPremium.prototype.getSelectedSection = function () {
    var family = this.fields["section-family"].value;
    var designation = this.fields.designation.value;
    var familySections = this.sectionsByFamily[family] || [];
    return familySections.find(function (section) {
      return section.designation === designation;
    }) || null;
  };

  OpenSectionCapacityPremium.prototype.readInputs = function () {
    return {
      major: this.fields.major.value,
      minor: this.fields.minor.value,
      shear: this.fields.shear.value
    };
  };

  OpenSectionCapacityPremium.prototype.updateValidationUI = function (errors) {
    var self = this;
    this.root.querySelectorAll("[data-error-for]").forEach(function (node) {
      var key = node.getAttribute("data-error-for");
      node.textContent = errors[key] || "";
      var field = self.fields[key];
      var shell = field ? field.closest(".et-oscp__control") : null;
      if (shell) {
        shell.classList.toggle("has-error", Boolean(errors[key]));
      }
    });
  };

  OpenSectionCapacityPremium.prototype.renderEquationPlaceholders = function () {
    if (!window.katex || typeof window.katex.render !== "function") {
      return;
    }

    window.katex.render(String.raw`\eta_x = \frac{M_x^*}{\phi M_{x}}, \quad \eta_y = \frac{M_y^*}{\phi M_{y}}, \quad \eta_v = \frac{V^*}{\phi V}`, this.equationPrimary, {
      displayMode: true,
      throwOnError: false
    });

    window.katex.render(String.raw`\eta_{gov} = \max(\eta_x,\eta_y,\eta_v), \qquad \text{PASS if } \eta_{gov} \leq 1.0`, this.equationSecondary, {
      displayMode: true,
      throwOnError: false
    });
  };

  OpenSectionCapacityPremium.prototype.renderEquations = function (result) {
    if (!window.katex || typeof window.katex.render !== "function") {
      return;
    }

    var major = result.checks.find(function (check) { return check.axisId === "major"; });
    var minor = result.checks.find(function (check) { return check.axisId === "minor"; });
    var shear = result.checks.find(function (check) { return check.axisId === "shear"; });

    window.katex.render(
      String.raw`\eta_x = \frac{M_x^*}{` + (major ? major.capacitySymbolTex : "\\phi M_x") + String.raw`} = ` + (major ? formatNumber(major.utilization, 3) : "--") +
      String.raw`,\quad \eta_y = \frac{M_y^*}{` + (minor ? minor.capacitySymbolTex : "\\phi M_y") + String.raw`} = ` + (minor ? formatNumber(minor.utilization, 3) : "--") +
      String.raw`,\quad \eta_v = \frac{V^*}{` + shear.capacitySymbolTex + String.raw`} = ` + formatNumber(shear.utilization, 3),
      this.equationPrimary,
      { displayMode: true, throwOnError: false }
    );

    window.katex.render(
      String.raw`\eta_{gov} = \max(\eta_x,\eta_y,\eta_v) = ` + formatNumber(result.governingUtilization, 3) +
      String.raw`, \qquad ` + (result.status === "PASS" ? "\\text{PASS}" : "\\text{FAIL}") +
      String.raw`\text{ when }\eta_{gov} ` + (result.status === "PASS" ? "\\leq" : ">") + String.raw` 1.0`,
      this.equationSecondary,
      { displayMode: true, throwOnError: false }
    );
  };

  OpenSectionCapacityPremium.prototype.renderChecks = function (checks, governingCheck) {
    this.checksList.innerHTML = checks.map(function (check) {
      var state = check.utilization <= 1 ? "pass" : "fail";
      var prefix = check.axisId === governingCheck.axisId ? "Governing " : "";
      var demandSymbol = check.axisId === "major" ? "Mx*" : (check.axisId === "minor" ? "My*" : "V*");
      return [
        '<li class="et-oscp__check et-oscp__check--', state, '">',
        "<strong>", escapeHtml(prefix + check.label), "</strong>",
        "<p>", escapeHtml(demandSymbol + " = " + formatNumber(check.demand, 2) + " " + check.unit + " against " + check.label + " capacity = " + formatNumber(check.capacity, 2) + " " + check.unit + "."), "</p>",
        "</li>"
      ].join("");
    }).join("");
  };

  OpenSectionCapacityPremium.prototype.drawEmptyDiagram = function () {
    this.diagram.innerHTML = [
      '<rect x="0" y="0" width="420" height="280" rx="18" fill="#f8fbff"></rect>',
      buildGridLines(420, 280, 18),
      '<text x="210" y="140" text-anchor="middle" class="et-oscp__diagram-empty">Section diagram appears here</text>'
    ].join("");
  };

  OpenSectionCapacityPremium.prototype.drawDiagram = function (section, governingCheck) {
    var family = section.diagram.family;
    var depthMm = section.diagram.depthMm;
    var flangeWidthMm = section.diagram.flangeWidthMm;
    var maxWidth = 170;
    var maxDepth = 180;
    var scale = Math.min(maxWidth / flangeWidthMm, maxDepth / depthMm);
    var width = flangeWidthMm * scale;
    var depth = depthMm * scale;
    var flangeThickness = Math.max(12, depth * section.diagram.flangeThicknessRatio);
    var webThickness = Math.max(12, width * section.diagram.webThicknessRatio);
    var shapeCentroidX = 210 + width * section.diagram.centroidShiftRatio;
    var axisCentroidX = 210 + 170 * section.diagram.centroidShiftRatio * 0.5;
    var centerY = 135;
    var xLeft = shapeCentroidX - width / 2;
    var yTop = centerY - depth / 2;
    var yBottom = centerY + depth / 2;
    var shapeMarkup = "";

    if (family === "channel") {
      shapeMarkup = [
        '<rect x="' + xLeft + '" y="' + yTop + '" width="' + webThickness + '" height="' + depth + '" rx="8" class="et-oscp__svg-shape"></rect>',
        '<rect x="' + xLeft + '" y="' + yTop + '" width="' + width + '" height="' + flangeThickness + '" rx="8" class="et-oscp__svg-shape"></rect>',
        '<rect x="' + xLeft + '" y="' + (yBottom - flangeThickness) + '" width="' + width + '" height="' + flangeThickness + '" rx="8" class="et-oscp__svg-shape"></rect>'
      ].join("");
    } else if (family === "tee") {
      shapeMarkup = [
        '<rect x="' + xLeft + '" y="' + yTop + '" width="' + width + '" height="' + flangeThickness + '" rx="8" class="et-oscp__svg-shape"></rect>',
        '<rect x="' + (shapeCentroidX - webThickness / 2) + '" y="' + yTop + '" width="' + webThickness + '" height="' + depth + '" rx="8" class="et-oscp__svg-shape"></rect>'
      ].join("");
    } else {
      shapeMarkup = [
        '<rect x="' + xLeft + '" y="' + yTop + '" width="' + width + '" height="' + flangeThickness + '" rx="8" class="et-oscp__svg-shape"></rect>',
        '<rect x="' + (shapeCentroidX - webThickness / 2) + '" y="' + yTop + '" width="' + webThickness + '" height="' + depth + '" rx="8" class="et-oscp__svg-shape"></rect>',
        '<rect x="' + xLeft + '" y="' + (yBottom - flangeThickness) + '" width="' + width + '" height="' + flangeThickness + '" rx="8" class="et-oscp__svg-shape"></rect>'
      ].join("");
    }

    var accent = getAxisAccent(governingCheck ? governingCheck.axisId : "major");

    this.diagram.innerHTML = [
      '<defs>',
      '<pattern id="et-oscp-grid-' + this.index + '" width="18" height="18" patternUnits="userSpaceOnUse"><path d="M 18 0 L 0 0 0 18" fill="none" stroke="#e6edf3" stroke-width="1"></path></pattern>',
      '<marker id="et-oscp-arrow-' + this.index + '" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#6f8195"></path></marker>',
      "</defs>",
      '<rect x="0" y="0" width="420" height="280" rx="18" fill="url(#et-oscp-grid-' + this.index + ')"></rect>',
      shapeMarkup,
      '<line x1="50" y1="135" x2="370" y2="135" stroke="' + accent + '" stroke-width="1.5" stroke-dasharray="6 5"></line>',
      '<line x1="' + axisCentroidX + '" y1="35" x2="' + axisCentroidX + '" y2="245" stroke="#1b9aaa" stroke-width="1.5" stroke-dasharray="6 5"></line>',
      '<circle cx="' + axisCentroidX + '" cy="135" r="5.5" fill="#ffffff" stroke="#0f172a" stroke-width="1.5"></circle>',
      '<line x1="85" y1="45" x2="85" y2="225" stroke="#6f8195" stroke-width="1.2" marker-start="url(#et-oscp-arrow-' + this.index + ')" marker-end="url(#et-oscp-arrow-' + this.index + ')"></line>',
      '<text x="70" y="132" class="et-oscp__svg-label et-oscp__svg-label-strong">Depth = ' + escapeHtml(formatNumber(depthMm, 0)) + ' mm</text>',
      '<line x1="140" y1="235" x2="280" y2="235" stroke="#6f8195" stroke-width="1.2" marker-start="url(#et-oscp-arrow-' + this.index + ')" marker-end="url(#et-oscp-arrow-' + this.index + ')"></line>',
      '<text x="172" y="254" class="et-oscp__svg-label">Flange width = ' + escapeHtml(formatNumber(flangeWidthMm, 0)) + ' mm</text>',
      '<text x="330" y="128" class="et-oscp__svg-label et-oscp__svg-axis-label">x-x</text>',
      '<text x="' + (axisCentroidX + 10) + '" y="52" class="et-oscp__svg-label et-oscp__svg-axis-label">y-y</text>',
      '<text x="' + (axisCentroidX + 10) + '" y="150" class="et-oscp__svg-label">centroid</text>'
    ].join("");
  };

  OpenSectionCapacityPremium.prototype.updateMetric = function (name, value, fallbackDecimals) {
    if (!this.outputs[name]) {
      return;
    }
    this.outputs[name].textContent = value === null ? "--" : (typeof value === "number" ? formatNumber(value, fallbackDecimals) : value);
  };

  OpenSectionCapacityPremium.prototype.update = function () {
    var section = this.getSelectedSection();
    this.populateCases(section, true);

    var errors = {};
    if (!section) {
      errors.designation = "Select a valid designation.";
      this.updateValidationUI(errors);
      this.resetOutputState();
      return;
    }

    var demandInputs = this.readInputs();
    var validation = validateDemands(section, demandInputs);
    this.updateValidationUI(validation.errors);

    this.outputs["section-type"].textContent = section.sectionType;
    this.outputs.designation.textContent = section.designation;
    this.outputs.grade.textContent = section.grade;
    if (this.outputs["nominal-depth"]) {
      this.outputs["nominal-depth"].textContent = formatNumber(section.diagram.depthMm, 0) + " mm";
    }
    if (this.outputs["flange-width"]) {
      this.outputs["flange-width"].textContent = formatNumber(section.diagram.flangeWidthMm, 0) + " mm";
    }

    var selectedMajor = section.majorAxis ? section.majorAxis.options.find(function (entry) {
      return entry.id === this.fields["major-case"].value;
    }, this) || section.majorAxis.options[0] : null;
    var selectedMinor = section.minorAxis ? section.minorAxis.options.find(function (entry) {
      return entry.id === this.fields["minor-case"].value;
    }, this) || section.minorAxis.options[0] : null;
    var shearOption = section.shearAxis.options[0];

    this.outputs["major-capacity"].textContent = selectedMajor ? formatNumber(selectedMajor.value, 2) + " kN·m" : "--";
    this.outputs["major-capacity-label"].textContent = selectedMajor ? selectedMajor.label : "Not applicable";
    this.outputs["minor-capacity"].textContent = selectedMinor ? formatNumber(selectedMinor.value, 2) + " kN·m" : "--";
    this.outputs["minor-capacity-label"].textContent = selectedMinor ? selectedMinor.label : "Not applicable";
    this.outputs["shear-capacity"].textContent = formatNumber(shearOption.value, 2) + " kN";
    this.outputs["shear-capacity-label"].textContent = shearOption.label;

    if (Object.keys(validation.errors).length) {
      this.resetOutputState();
      this.drawDiagram(section, null);
      return;
    }

    var result = calculateUtilization(section, demandInputs, {
      majorCaseId: this.fields["major-case"].value,
      minorCaseId: this.fields["minor-case"].value
    });

    if (!result) {
      this.resetOutputState();
      this.drawDiagram(section, null);
      return;
    }

    var majorCheck = result.checks.find(function (check) { return check.axisId === "major"; });
    var minorCheck = result.checks.find(function (check) { return check.axisId === "minor"; });
    var shearCheck = result.checks.find(function (check) { return check.axisId === "shear"; });
    var tone = result.status === "PASS" ? "pass" : "fail";

    this.heroCard.dataset.tone = tone;
    this.outputs["status-pill"].textContent = result.status;
    this.outputs["status-pill"].dataset.tone = tone;
    this.outputs["status-text"].textContent = result.status;
    this.outputs["governing-utilisation"].textContent = formatNumber(result.governingUtilization, 3);
    this.outputs["reserve-factor"].textContent = Number.isFinite(result.reserveFactor) ? formatNumber(result.reserveFactor, 2) : "--";
    this.outputs["major-utilisation"].textContent = majorCheck ? formatNumber(majorCheck.utilization, 3) : "--";
    this.outputs["minor-utilisation"].textContent = minorCheck ? formatNumber(minorCheck.utilization, 3) : "--";
    this.outputs["shear-utilisation"].textContent = formatNumber(shearCheck.utilization, 3);
    this.outputs["major-summary"].textContent = majorCheck ? majorCheck.label + " capacity" : "Not applicable";
    this.outputs["minor-summary"].textContent = minorCheck ? minorCheck.label + " capacity" : "Not applicable";
    this.outputs["shear-summary"].textContent = shearCheck.label + " capacity";
    this.outputs["governing-case"].textContent = result.governingCheck.label;
    this.outputs["governing-capacity"].textContent = result.governingCheck.label + " capacity = " + formatNumber(result.governingCheck.capacity, 2) + " " + result.governingCheck.unit;
    this.outputs["visual-status"].textContent = result.status + " · " + result.governingCheck.axisId;
    this.outputs["visual-status"].dataset.tone = tone;
    this.outputs["hero-note"].textContent = result.governingCheck.label + " governs the selected section at " + formatNumber(result.governingUtilization, 3) + ".";
    this.outputs["governing-note"].textContent = result.governingCheck.label + " governs at " + formatNumber(result.governingUtilization, 3) + ".";

    this.renderChecks(result.checks, result.governingCheck);
    this.renderEquations(result);
    this.drawDiagram(section, result.governingCheck);
    this.lastState = {
      timestamp: Date.now(),
      section: section,
      result: result,
      demands: {
        major: Number(demandInputs.major),
        minor: Number(demandInputs.minor),
        shear: Number(demandInputs.shear)
      }
    };
  };

  OpenSectionCapacityPremium.prototype.resetOutputState = function () {
    this.heroCard.dataset.tone = "idle";
    this.outputs["status-pill"].textContent = "No result";
    this.outputs["status-pill"].dataset.tone = "";
    this.outputs["status-text"].textContent = "--";
    this.outputs["governing-utilisation"].textContent = "--";
    this.outputs["reserve-factor"].textContent = "--";
    this.outputs["major-utilisation"].textContent = "--";
    this.outputs["minor-utilisation"].textContent = "--";
    this.outputs["shear-utilisation"].textContent = "--";
    this.outputs["governing-case"].textContent = "--";
    this.outputs["governing-capacity"].textContent = "Selected capacity";
    this.outputs["visual-status"].textContent = "Awaiting valid inputs";
    this.outputs["visual-status"].dataset.tone = "";
    this.outputs["hero-note"].textContent = "Results remain blank until all required inputs are valid.";
    this.outputs["governing-note"].textContent = "Select a section and enter design actions to evaluate utilisation.";
    this.renderEquationPlaceholders();
    this.checksList.innerHTML = '<li class="et-oscp__check et-oscp__check--warn"><strong>Input validation</strong><p>Results are shown only when the section, capacities, and design actions are valid.</p></li>';
    this.lastState = null;
  };

  OpenSectionCapacityPremium.prototype.saveCurrentResult = function () {
    if (!this.lastState) {
      return;
    }

    this.savedResults.unshift({
      timestamp: this.lastState.timestamp,
      sectionFamily: this.lastState.section.sectionType,
      designation: this.lastState.section.designation,
      major: formatNumber(this.lastState.demands.major, 2) + " kN·m",
      minor: formatNumber(this.lastState.demands.minor, 2) + " kN·m",
      shear: formatNumber(this.lastState.demands.shear, 2) + " kN",
      utilisation: formatNumber(this.lastState.result.governingUtilization, 3),
      status: this.lastState.result.status
    });

    writeStorage(this.storageKey, this.savedResults);
    this.renderSavedResults();
  };

  OpenSectionCapacityPremium.prototype.renderSavedResults = function () {
    if (!this.savedResults.length) {
      this.savedResultsBody.innerHTML = '<tr><td class="et-oscp__empty-row" colspan="8">No results saved yet. Run a valid check, then save it to build a comparison table.</td></tr>';
      return;
    }

    this.savedResultsBody.innerHTML = this.savedResults.map(function (row) {
      return [
        "<tr>",
        "<td>", escapeHtml(formatDateTime(row.timestamp)), "</td>",
        "<td>", escapeHtml(row.sectionFamily), "</td>",
        "<td>", escapeHtml(row.designation), "</td>",
        "<td>", escapeHtml(row.major), "</td>",
        "<td>", escapeHtml(row.minor), "</td>",
        "<td>", escapeHtml(row.shear), "</td>",
        "<td>", escapeHtml(row.utilisation), "</td>",
        "<td>", escapeHtml(row.status), "</td>",
        "</tr>"
      ].join("");
    }).join("");
  };

  OpenSectionCapacityPremium.prototype.exportWordReport = async function () {
    if (!this.lastState || this.isExporting || !window.docx) {
      if (this.outputs["export-feedback"] && !window.docx) {
        this.outputs["export-feedback"].textContent = "Word export library is not available.";
      }
      return;
    }

    this.isExporting = true;
    if (this.actions["export-word-report"]) {
      this.actions["export-word-report"].disabled = true;
    }
    if (this.outputs["export-feedback"]) {
      this.outputs["export-feedback"].textContent = "Exporting Word Report...";
    }

    try {
      var report = await buildWordReportData(this);
      await writeWordReport(report);
      if (this.outputs["export-feedback"]) {
        this.outputs["export-feedback"].textContent = "Word report generated successfully.";
      }
    } catch (error) {
      if (this.outputs["export-feedback"]) {
        this.outputs["export-feedback"].textContent = "Unable to export the Word report.";
      }
    } finally {
      this.isExporting = false;
      if (this.actions["export-word-report"]) {
        this.actions["export-word-report"].disabled = false;
      }
    }
  };

  async function buildWordReportData(tool) {
    var state = tool.lastState;
    var figure = await extractToolFigure(tool.root);
    return {
      section: state.section,
      result: state.result,
      demands: state.demands,
      generated: new Date(),
      figure: figure
    };
  }

  async function writeWordReport(report) {
    var docx = window.docx;
    var footer = new docx.Footer({
      children: [
        new docx.Paragraph({
          alignment: docx.AlignmentType.CENTER,
          children: [
            new docx.TextRun({ text: "Page ", size: 18, color: "5D7682" }),
            docx.PageNumber.CURRENT,
            new docx.TextRun({ text: " of ", size: 18, color: "5D7682" }),
            docx.PageNumber.TOTAL_PAGES
          ]
        })
      ]
    });

    var rows = [
      ["Section Family", report.section.sectionType],
      ["Designation", report.section.designation],
      ["Material Grade", report.section.grade],
      ["Generated", report.generated.toLocaleString("en-AU")],
      ["Governing Utilisation", formatNumber(report.result.governingUtilization, 3)],
      ["Reserve Factor", Number.isFinite(report.result.reserveFactor) ? formatNumber(report.result.reserveFactor, 3) : "N/A"],
      ["Status", report.result.status]
    ];

    var inputRows = [
      ["Applied major-axis moment", formatNumber(report.demands.major, 2), "kN.m"],
      ["Applied minor-axis moment", formatNumber(report.demands.minor, 2), "kN.m"],
      ["Applied design shear", formatNumber(report.demands.shear, 2), "kN"],
      ["Estimated section depth", formatNumber(report.section.diagram.depthMm, 0), "mm"],
      ["Estimated flange width", formatNumber(report.section.diagram.flangeWidthMm, 0), "mm"]
    ];

    var resultRows = report.result.checks.map(function (check) {
      return [
        check.label,
        formatNumber(check.demand, 2) + " " + (check.unit === "kNm" ? "kN.m" : "kN"),
        formatNumber(check.capacity, 2) + " " + (check.unit === "kNm" ? "kN.m" : "kN"),
        "Utilisation = " + formatNumber(check.utilization, 3)
      ];
    });

    var children = [
      new docx.Paragraph({ text: "Open Section Capacity Premium", heading: docx.HeadingLevel.TITLE, spacing: { after: 80 } }),
      new docx.Paragraph({ children: [new docx.TextRun({ text: "Structural Engineering Calculation Sheet", size: 24, color: "5D7682" })], spacing: { after: 140 } }),
      createWordTable(["Field", "Value"], rows),
      new docx.Paragraph({ spacing: { after: 100 } }),
      createWordTable(["Input", "Value", "Unit"], inputRows),
      new docx.Paragraph({ spacing: { after: 100 } }),
      createWordTable(["Check", "Demand", "Capacity", "Comment"], resultRows)
    ];

    if (report.figure) {
      children.push(new docx.Paragraph({ spacing: { after: 80 } }));
      children.push.apply(children, addWordImage(report.figure));
    }

    children.push(new docx.Paragraph({ spacing: { after: 60 } }));
    children.push(new docx.Paragraph({ children: [new docx.TextRun({ text: "Methodology", bold: true, color: "1778D6", size: 24 })], spacing: { before: 120, after: 60 } }));
    children.push(new docx.Paragraph({ text: "Applied design actions are compared directly against the chosen tabulated section capacities using demand-to-capacity ratios.", bullet: { level: 0 }, spacing: { after: 50 } }));
    children.push(new docx.Paragraph({ text: "The governing utilisation is taken as the maximum active ratio and is used for the PASS or FAIL assessment.", bullet: { level: 0 }, spacing: { after: 50 } }));
    children.push(new docx.Paragraph({ children: [new docx.TextRun({ text: "Assumptions", bold: true, color: "1778D6", size: 24 })], spacing: { before: 120, after: 60 } }));
    children.push(new docx.Paragraph({ text: "Section geometry shown in the visualisation is an estimated envelope derived from the designation for communication purposes only.", bullet: { level: 0 }, spacing: { after: 50 } }));
    children.push(new docx.Paragraph({ text: "Tabulated capacities are assumed to be applicable for the chosen section and design scenario.", bullet: { level: 0 }, spacing: { after: 50 } }));
    children.push(new docx.Paragraph({ children: [new docx.TextRun({ text: "Disclaimer", bold: true, color: "1778D6", size: 24 })], spacing: { before: 120, after: 60 } }));
    children.push(new docx.Paragraph({ text: "This report is generated automatically and must be reviewed by the responsible engineer before issue.", spacing: { after: 50 } }));

    var document = new docx.Document({
      creator: "Open Section Capacity Premium",
      title: "Open Section Capacity Premium",
      sections: [{
        properties: {
          page: {
            margin: { top: 720, right: 720, bottom: 720, left: 720, header: 360, footer: 360 },
            size: { width: 11906, height: 16838 }
          }
        },
        footers: { default: footer },
        children: children
      }]
    });

    var blob = await docx.Packer.toBlob(document);
    triggerDownload(blob, "open-section-capacity-premium_" + formatFileTimestamp(report.generated) + ".docx");
  }

  async function extractToolFigure(root) {
    var svgElement = root.querySelector("[data-export-visualization='true'] svg");
    if (!svgElement) {
      return null;
    }
    return await svgToWordFigure(svgElement, "Figure 1 – Section visualisation");
  }

  async function svgToWordFigure(svgElement, caption) {
    var clonedSvg = cloneSvgWithComputedStyles(svgElement);
    var viewBox = svgElement.viewBox && svgElement.viewBox.baseVal;
    var width = viewBox && viewBox.width ? viewBox.width : 420;
    var height = viewBox && viewBox.height ? viewBox.height : 280;
    clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clonedSvg.setAttribute("width", String(width));
    clonedSvg.setAttribute("height", String(height));
    var svgString = new XMLSerializer().serializeToString(clonedSvg);
    var svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    var svgUrl = URL.createObjectURL(svgBlob);

    try {
      var image = await loadImage(svgUrl);
      var canvas = document.createElement("canvas");
      canvas.width = width * 2;
      canvas.height = height * 2;
      var context = canvas.getContext("2d");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      var blob = await canvasToBlob(canvas);
      return {
        data: await blobToUint8Array(blob),
        width: canvas.width,
        height: canvas.height,
        caption: caption
      };
    } finally {
      URL.revokeObjectURL(svgUrl);
    }
  }

  function addWordImage(figure) {
    var docx = window.docx;
    var targetWidth = Math.min(520, Math.round(figure.width / 2));
    var targetHeight = Math.round(targetWidth * (figure.height / figure.width));
    return [
      new docx.Paragraph({
        alignment: docx.AlignmentType.CENTER,
        spacing: { before: 60, after: 30 },
        children: [new docx.ImageRun({ data: figure.data, type: "png", transformation: { width: targetWidth, height: targetHeight } })]
      }),
      new docx.Paragraph({
        alignment: docx.AlignmentType.CENTER,
        spacing: { after: 90 },
        children: [new docx.TextRun({ text: figure.caption, italics: true, color: "5D7682", size: 18 })]
      })
    ];
  }

  function createWordTable(headers, rows) {
    var docx = window.docx;
    return new docx.Table({
      width: { size: 100, type: docx.WidthType.PERCENTAGE },
      layout: docx.TableLayoutType.FIXED,
      rows: [
        new docx.TableRow({
          tableHeader: true,
          children: headers.map(function (header) {
            return new docx.TableCell({
              shading: { fill: "EAF2F8" },
              verticalAlign: docx.VerticalAlign.CENTER,
              children: [new docx.Paragraph({ alignment: docx.AlignmentType.CENTER, children: [new docx.TextRun({ text: header, bold: true, color: "17313A", size: 18 })] })]
            });
          })
        })
      ].concat(rows.map(function (row) {
        return new docx.TableRow({
          children: row.map(function (value, index) {
            return new docx.TableCell({
              verticalAlign: docx.VerticalAlign.CENTER,
              children: [new docx.Paragraph({ alignment: index === 0 ? docx.AlignmentType.LEFT : docx.AlignmentType.CENTER, children: [new docx.TextRun({ text: String(value), color: "17313A", size: 18 })] })]
            });
          })
        });
      }))
    });
  }

  function cloneSvgWithComputedStyles(svg) {
    var clone = svg.cloneNode(true);
    var sourceElements = [svg].concat(Array.prototype.slice.call(svg.querySelectorAll("*")));
    var targetElements = [clone].concat(Array.prototype.slice.call(clone.querySelectorAll("*")));
    sourceElements.forEach(function (sourceElement, index) {
      var targetElement = targetElements[index];
      if (!targetElement) {
        return;
      }
      var computedStyle = window.getComputedStyle(sourceElement);
      var styleText = Array.prototype.slice.call(computedStyle).map(function (propertyName) {
        return propertyName + ":" + computedStyle.getPropertyValue(propertyName) + ";";
      }).join("");
      targetElement.setAttribute("style", styleText);
    });
    return clone;
  }

  function loadImage(url) {
    return new Promise(function (resolve, reject) {
      var image = new Image();
      image.onload = function () { resolve(image); };
      image.onerror = function () { reject(new Error("Unable to load image for report export.")); };
      image.src = url;
    });
  }

  function canvasToBlob(canvas) {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) {
        if (blob) {
          resolve(blob);
          return;
        }
        reject(new Error("Unable to convert canvas to PNG blob."));
      }, "image/png");
    });
  }

  function blobToUint8Array(blob) {
    return blob.arrayBuffer().then(function (buffer) {
      return new Uint8Array(buffer);
    });
  }

  function triggerDownload(blob, fileName) {
    var link = window.document.createElement("a");
    var url = URL.createObjectURL(blob);
    link.href = url;
    link.download = fileName;
    window.document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  function formatFileTimestamp(date) {
    return [
      String(date.getFullYear()),
      "-",
      String(date.getMonth() + 1).padStart(2, "0"),
      "-",
      String(date.getDate()).padStart(2, "0"),
      "_",
      String(date.getHours()).padStart(2, "0"),
      String(date.getMinutes()).padStart(2, "0")
    ].join("");
  }

  function boot() {
    document.querySelectorAll('.et-tool[data-et-tool="' + TOOL_SLUG + '"]').forEach(function (root, index) {
      if (root.dataset.etInitialised === "true") {
        return;
      }
      root.dataset.etInitialised = "true";
      new OpenSectionCapacityPremium(root, index).init();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  document.addEventListener("engineering-tools:ready", boot);
}());
