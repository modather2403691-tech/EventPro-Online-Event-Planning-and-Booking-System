// EventPro — site-wide Arabic <-> English translation.
// A floating toggle swaps static UI text using the dictionary below and flips
// the page to RTL for Arabic. The choice is remembered in localStorage.
// Dynamic data (event titles, names, user input) stays as entered.

(function () {
  const EN_AR = {
    // Brand / generic nav
    "Home": "الرئيسية",
    "Packages": "الباقات",
    "Customize Your Packages": "خصّص باقاتك",
    "Book Event": "احجز فعالية",
    "Book Now": "احجز الآن",
    "Dashboard": "لوحة التحكم",
    "My Dashboard": "لوحتي",
    "Sign In": "تسجيل الدخول",
    "Sign Up": "إنشاء حساب",
    "Login": "تسجيل الدخول",
    "Log In": "تسجيل الدخول",
    "Logout": "تسجيل الخروج",
    "Register": "تسجيل",
    "Profile": "الملف الشخصي",
    "My Bookings": "حجوزاتي",
    "My Requests": "طلباتي",
    "Request Custom Event": "اطلب فعالية مخصّصة",
    "Booking Requests": "طلبات الحجز",
    "Requests": "الطلبات",
    "Add Event": "إضافة فعالية",
    "My Events": "فعالياتي",
    "Back to Home": "العودة للرئيسية",
    "Organizer Panel": "لوحة المنظّم",
    "Client Panel": "لوحة العميل",
    "Admin Panel": "لوحة المشرف",
    "Manage Users": "إدارة المستخدمين",
    "Client Reservation": "حجوزات العملاء",
    "Organizer Event": "فعاليات المنظّم",
    "Reports": "التقارير",
    "Organizer": "منظّم",
    "Client": "عميل",
    "Admin": "مشرف",

    // Buttons / actions
    "Explore Events": "استكشف الفعاليات",
    "Explore Packages": "استكشف الباقات",
    "Join Event": "انضم للفعالية",
    "Manage": "إدارة",
    "Details": "التفاصيل",
    "Get Started": "ابدأ الآن",
    "Submit": "إرسال",
    "Submit Booking": "تأكيد الحجز",
    "Send Request to Organizers": "إرسال الطلب للمنظّمين",
    "Send Offer": "إرسال عرض",
    "Update": "تحديث",
    "Accept": "قبول",
    "Reject": "رفض",
    "Confirm": "تأكيد",
    "Decline": "رفض",
    "Cancel Request": "إلغاء الطلب",
    "Delete Event": "حذف الفعالية",
    "Book Again": "احجز مجدداً",
    "Create Event": "إنشاء فعالية",
    "Create Your First Event": "أنشئ أول فعالية لك",
    "Request a Custom Event": "اطلب فعالية مخصّصة",
    "Book Your First Event": "احجز أول فعالية لك",
    "View Requests": "عرض الطلبات",
    "Save Changes": "حفظ التغييرات",
    "Edit": "تعديل",
    "Save": "حفظ",
    "Cancel": "إلغاء",
    "Remove": "إزالة",

    // Headings
    "Book Your Event": "احجز فعاليتك",
    "Organizer Dashboard": "لوحة تحكم المنظّم",
    "Client Dashboard": "لوحة تحكم العميل",
    "Organizer Profile": "ملف المنظّم",
    "Client Profile": "ملف العميل",
    "Open Requests": "الطلبات المفتوحة",
    "Plan Your Perfect Event": "خطّط لفعاليتك المثالية",
    "Your Events": "فعالياتك",

    // Form labels
    "Full Name": "الاسم الكامل",
    "Email": "البريد الإلكتروني",
    "Phone Number": "رقم الهاتف",
    "Event Type": "نوع الفعالية",
    "Event Date": "تاريخ الفعالية",
    "Preferred Date": "التاريخ المفضّل",
    "Number of Guests": "عدد الضيوف",
    "Details / Notes": "تفاصيل / ملاحظات",
    "Title:": "العنوان:",
    "Category:": "الفئة:",
    "Date of Event:": "تاريخ الفعالية:",
    "Capacity:": "السعة:",
    "Price ($):": "السعر ($):",
    "Location:": "الموقع:",
    "Rules:": "القواعد:",
    "Event Image:": "صورة الفعالية:",

    // Categories / filters / statuses
    "Party": "حفلة",
    "Parties": "حفلات",
    "Corporate": "شركات",
    "Wedding": "زفاف",
    "Birthday": "عيد ميلاد",
    "Engagement": "خطوبة",
    "Other": "أخرى",
    "All Types": "كل الأنواع",
    "All Prices": "كل الأسعار",
    "Pending": "قيد الانتظار",
    "Confirmed": "مؤكد",
    "Declined": "مرفوض",
    "Open": "مفتوح",
    "Cancelled": "ملغى",
    "Active": "نشط",
    "Available": "متاح",

    // Table headers / misc
    "Request ID": "رقم الطلب",
    "Booking ID": "رقم الحجز",
    "Client Name": "اسم العميل",
    "Phone": "الهاتف",
    "Guests": "الضيوف",
    "Status": "الحالة",
    "Action": "إجراء",
    "Actions": "إجراءات",
    "Booked On": "تاريخ الحجز",
    "Your Offer": "عرضك",
    "Date": "التاريخ",
    "Total Cost": "التكلفة الإجمالية",
    "Total Price:": "السعر الإجمالي:",
    "Bookings": "الحجوزات",
    "Offers": "العروض",
    "Event Title": "عنوان الفعالية",
    "Event ID": "رقم الفعالية",

    // Placeholders
    "Enter event title": "أدخل عنوان الفعالية",
    "Enter number of people": "أدخل عدد الأشخاص",
    "Ticket price per guest": "سعر التذكرة للضيف",
    "Enter location": "أدخل الموقع",
    "Enter rules here...": "أدخل القواعد هنا...",
    "Describe your event, theme, budget, services you need...": "صف فعاليتك، الفكرة، الميزانية، والخدمات التي تحتاجها...",
    "Search events by name... 🔍": "ابحث عن الفعاليات بالاسم... 🔍",
    "Price $": "السعر $",

    // Sentences
    "No events available yet. Check back soon!": "لا توجد فعاليات متاحة بعد. تابعنا قريباً!",
    "No open booking requests right now.": "لا توجد طلبات حجز مفتوحة حالياً.",
    "You haven't created any events yet.": "لم تنشئ أي فعاليات بعد.",
    "No bookings found yet.": "لا توجد حجوزات بعد.",
    "You haven't made any requests yet.": "لم تقم بأي طلبات بعد.",
    "No offers yet. Organizers will reply soon.": "لا توجد عروض بعد. سيردّ المنظّمون قريباً.",

    // Landing / hero
    "Plan better events with EventPro": "خطّط لفعاليات أفضل مع EventPro",
    "Designed for smooth event planning, online booking, and easy management.": "مصمّم لتخطيط سلس للفعاليات، وحجز عبر الإنترنت، وإدارة سهلة.",
    "Find and book the right event package faster": "اعثر واحجز الباقة المناسبة بشكل أسرع",
    "Choose services like catering, decoration, and photography": "اختر خدمات مثل الضيافة والديكور والتصوير",
    "Manage bookings through client, organizer, and admin dashboards": "أدر الحجوزات عبر لوحات العميل والمنظّم والمشرف",
    "Track schedules, requests, and upcoming events": "تابع الجداول والطلبات والفعاليات القادمة",
    "Event planning made simple — browse packages, book services, and manage events in one platform.": "تخطيط الفعاليات أصبح بسيطاً — تصفّح الباقات، احجز الخدمات، وأدر الفعاليات في منصة واحدة.",
    "AI for smarter events": "ذكاء اصطناعي لفعاليات أذكى",
    "Learn how EventPro works": "تعرّف على كيفية عمل EventPro",
    "Your all-in-one solution for every event": "حلّك المتكامل لكل فعالية",
    "events managed": "فعاليات تمت إدارتها",
    "registrations processed": "تسجيلات تمت معالجتها",
    "partners globally": "شركاء حول العالم",
    "customer support": "دعم العملاء",
    "Trusted by top organizations": "موثوق من كبرى المؤسسات",
    "Wedding Package": "باقة الزفاف",
    "Party Package": "باقة الحفلات",
    "Birthday Package": "باقة عيد الميلاد",

    // Client / organizer hero copy
    "Browse events, join activities, and manage your bookings easily with EventPro.": "تصفّح الفعاليات، شارك في الأنشطة، وأدر حجوزاتك بسهولة مع EventPro.",
    "Explore available events from organizers": "استكشف الفعاليات المتاحة من المنظّمين",
    "Join events and book services easily": "انضم للفعاليات واحجز الخدمات بسهولة",
    "Track your bookings and schedules": "تابع حجوزاتك وجداولك",
    "Manage your profile and preferences": "أدر ملفك وتفضيلاتك",
    "Create and manage events, handle booking requests, and grow your business.": "أنشئ وأدر الفعاليات، وتعامل مع طلبات الحجز، ونمِّ أعمالك.",
    "Accept or reject booking requests": "اقبل أو ارفض طلبات الحجز",
    "Track upcoming events": "تابع الفعاليات القادمة",
    "Manage your events and bookings": "أدر فعالياتك وحجوزاتك",

    // Footer
    "About": "من نحن",
    "Resources": "الموارد",
    "Support": "الدعم",
    "Our Team": "فريقنا",
    "Careers": "الوظائف",
    "Partners": "الشركاء",
    "Blog": "المدونة",
    "Case Studies": "دراسات الحالة",
    "Guides": "الأدلة",
    "Help Center": "مركز المساعدة",
    "Security": "الأمان",
    "Contact Support": "تواصل مع الدعم",
    "© 2026 EventPro. All rights reserved.": "© 2026 EventPro. جميع الحقوق محفوظة.",

    // Section subtitles
    "Manage the events you created and see who booked each one.": "أدر الفعاليات التي أنشأتها وشاهد من حجز كلاً منها.",
    "No bookings for this event yet.": "لا توجد حجوزات لهذه الفعالية بعد.",
    "Custom event requests from clients. Reply with your price — the client picks the offer they like best.": "طلبات فعاليات مخصّصة من العملاء. ردّ بسعرك — ويختار العميل العرض الأفضل له.",
    "Track your custom event requests and the offers organizers send you.": "تابع طلبات فعالياتك المخصّصة والعروض التي يرسلها لك المنظّمون.",
    "Tell us about the party or event you want. Your request is sent to all organizers — they reply with a price, and you choose the best offer.": "أخبرنا عن الحفلة أو الفعالية التي تريدها. يُرسل طلبك لكل المنظّمين — يردّون بسعر، وتختار أنت أفضل عرض.",
    "View all your booked events, dates, costs, and current status.": "اعرض كل فعالياتك المحجوزة وتواريخها وتكاليفها وحالتها الحالية.",
    "Track your bookings, event progress, and activity overview in one place.": "تابع حجوزاتك وتقدّم فعالياتك ونظرة عامة على نشاطك في مكان واحد.",

    // Dashboard cards / sections
    "Total Packages": "إجمالي الباقات",
    "Pending Requests": "الطلبات المعلّقة",
    "Upcoming Events": "الفعاليات القادمة",
    "Recent Booking Requests": "أحدث طلبات الحجز",
    "Total Bookings": "إجمالي الحجوزات",
    "Upcoming": "القادمة",
    "Completed": "المكتملة",
    "Analytics": "التحليلات",
    "Awaiting Confirmation": "في انتظار التأكيد",
    "Bookings in Progress": "حجوزات قيد التنفيذ",
    "Completed Bookings": "الحجوزات المكتملة",

    // Packages
    "Customize your perfect event with our best packages": "خصّص فعاليتك المثالية مع أفضل باقاتنا",
    "Most Popular": "الأكثر شعبية",
    "Included Services:": "الخدمات المشمولة:",
    "Additional Services:": "خدمات إضافية:",

    // 404 + edit panels
    "Page Not Found": "الصفحة غير موجودة",
    "Go Home": "العودة للرئيسية",
    "Oops! The page you're looking for doesn't exist or has moved.": "عذراً! الصفحة التي تبحث عنها غير موجودة أو تم نقلها.",
    "Edit event details": "تعديل تفاصيل الفعالية",
    "Delete": "حذف",
    "Title": "العنوان",
    "Category": "الفئة",
    "Capacity": "السعة",
    "Price ($)": "السعر ($)",
    "Location": "الموقع",
    "Rules": "القواعد",
    "Create Your First Event": "أنشئ أول فعالية لك",

    // Tickets / check-in
    "Entry Ticket": "تذكرة الدخول",
    "Ticket ID": "رقم التذكرة",
    "Guest": "الضيف",
    "Total": "الإجمالي",
    "Show this ticket ID at the entrance to get in.": "اعرض رقم التذكرة عند المدخل للدخول."
  };

  const STORAGE_KEY = "eventpro-lang";

  // Translate visible text nodes, remembering the English original on each node.
  function walkText(translate) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentNode;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = parent.nodeName;
        if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") return NodeFilter.FILTER_REJECT;
        if (parent.classList && parent.classList.contains("eventpro-lang-btn")) return NodeFilter.FILTER_REJECT;
        return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach((node) => {
      if (translate) {
        const raw = node.nodeValue;
        const key = raw.trim();
        if (EN_AR[key]) {
          if (node.__en === undefined) node.__en = raw;
          node.nodeValue = raw.replace(key, EN_AR[key]);
        }
      } else if (node.__en !== undefined) {
        node.nodeValue = node.__en;
      }
    });
  }

  // Placeholders on inputs / textareas.
  function walkPlaceholders(translate) {
    document.querySelectorAll("input[placeholder], textarea[placeholder]").forEach((el) => {
      if (translate) {
        const key = el.getAttribute("placeholder");
        if (EN_AR[key]) {
          if (el.__enPlaceholder === undefined) el.__enPlaceholder = key;
          el.setAttribute("placeholder", EN_AR[key]);
        }
      } else if (el.__enPlaceholder !== undefined) {
        el.setAttribute("placeholder", el.__enPlaceholder);
      }
    });
  }

  function apply(lang) {
    const toArabic = lang === "ar";
    walkText(toArabic);
    walkPlaceholders(toArabic);
    document.documentElement.lang = toArabic ? "ar" : "en";
    document.documentElement.dir = toArabic ? "rtl" : "ltr";

    if (EN_AR[document.title]) {
      if (document.__enTitle === undefined) document.__enTitle = document.title;
    }

    const btn = document.querySelector(".eventpro-lang-btn");
    if (btn) btn.textContent = toArabic ? "EN" : "ع";
  }

  document.addEventListener("DOMContentLoaded", function () {
    const btn = document.createElement("button");
    btn.className = "eventpro-lang-btn";
    btn.type = "button";
    btn.title = "Toggle language / تبديل اللغة";
    btn.style.cssText = [
      "position:fixed",
      "bottom:25px",
      "left:25px",
      "width:50px",
      "height:50px",
      "border-radius:50%",
      "background-color:#6c3fc5",
      "color:#ffffff",
      "border:none",
      "box-shadow:0 4px 10px rgba(0,0,0,0.3)",
      "cursor:pointer",
      "font-size:18px",
      "font-weight:bold",
      "z-index:99999",
      "display:flex",
      "align-items:center",
      "justify-content:center"
    ].join(";");
    document.body.appendChild(btn);

    let lang = localStorage.getItem(STORAGE_KEY) === "ar" ? "ar" : "en";
    apply(lang);

    btn.addEventListener("click", function () {
      lang = lang === "ar" ? "en" : "ar";
      localStorage.setItem(STORAGE_KEY, lang);
      apply(lang);
    });
  });
})();
