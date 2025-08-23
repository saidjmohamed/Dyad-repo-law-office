export interface Court {
  name: string;
  divisions: string[];
}

export interface Council {
  name: string;
  chambers: string[];
}

export interface JudicialStructure {
  case_types: string[];
  case_categories: string[];
  appeal_types: string[];
  complaint_followed_by_options: string[];
  courts: Court[];
  councils: Council[];
}

export const judicialStructure: JudicialStructure = {
  case_types: [
    "مدنية",
    "جنائية",
    "جنح",
    "استعجالية",
    "أحوال شخصية",
    "أحداث",
    "اجتماعية",
    "عقارية",
    "تجارية",
    "إدارية",
    "بحري",
    "تنفيذ",
    "تحقيق",
    "شكوى",
  ],
  case_categories: [
    "مدني",
    "جزائي",
  ],
  appeal_types: [
    "معارضة",
    "استئناف",
    "طلب إعادة التماس",
    "طعن بالنقض لدى المحكمة العليا",
  ],
  complaint_followed_by_options: [
    "قاضي التحقيق",
    "وكيل الجمهورية",
  ],
  courts: [
    {
      name: "المحكمة الابتدائية",
      divisions: [
        "مدني",
        "جنائي",
        "جنح",
        "استعجالي",
        "شؤون الأسرة",
        "الأحداث",
        "اجتماعي",
        "عقاري",
      ],
    },
    {
      name: "المحكمة الإدارية",
      divisions: [
        "إداري",
      ],
    },
    {
      name: "محكمة الاستئناف",
      divisions: [
        "مدني",
        "جنائي",
        "جنح",
        "استعجالي",
        "شؤون الأسرة",
        "الأحداث",
        "اجتماعي",
        "عقاري",
      ],
    },
  ],
  councils: [
    {
      name: "مجلس الدولة",
      chambers: [
        "إداري",
      ],
    },
    {
      name: "المحكمة العليا",
      chambers: [
        "مدني",
        "جنائي",
        "غرفة الاتهام",
        "استعجالي",
        "شؤون الأسرة",
        "الأحداث",
        "اجتماعي",
        "عقاري",
        "تجاري",
        "بحري",
      ],
    },
  ],
};