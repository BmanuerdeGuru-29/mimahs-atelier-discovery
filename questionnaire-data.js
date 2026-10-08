/* Mimah's Atelier – Business & Website Discovery Questionnaire
 * Single source of truth. Used by:
 *   - index.html / app.js  (the interactive questionnaire)
 *   - build.js             (generates the JSON schema + readable documents)
 *
 * Question types: text, longtext, radio, checkbox, number, money, url, email, tel, date,
 *                 file, matrix, rank, repeater, multitext
 * Flags: required, ex (example), help (plain-language hint), other (adds "Other" text box),
 *        canHelp (adds "Please help me write this"), noChips, max (checkbox limit),
 *        showIf {id, any:[values]}, sum (Discovery Summary heading)
 */
(function () {
  const q = (type, id, label, o = {}) => Object.assign({ id, type, label, required: false }, o);
  const T = (id, l, o) => q("text", id, l, o);
  const L = (id, l, o) => q("longtext", id, l, o);
  const R = (id, l, options, o) => q("radio", id, l, Object.assign({ options }, o));
  const C = (id, l, options, o) => q("checkbox", id, l, Object.assign({ options }, o));
  const N = (id, l, o) => q("number", id, l, o);
  const U = (id, l, o) => q("url", id, l, o);
  const F = (id, l, o) => q("file", id, l, o);
  const X = (id, l, choices, rows, o) => q("matrix", id, l, Object.assign({ choices, rows: rows.map(r => ({ id: r[0], label: r[1], help: r[2] || "" })) }, o));
  const YN = ["Yes", "No", "Not sure yet"];
  const NEED = ["Essential", "Nice to have", "Not needed", "Not sure"];

  const Q = {
    id: "mimahs-atelier-discovery",
    version: "1.0.0",
    title: "Business & Website Discovery Questionnaire",
    brand: "MIMAH'S ATELIER",
    storageNote: "Your answers are saved only on this device, in this browser. Nothing is sent anywhere until you choose to send the file yourself.",
    chipLabels: { unsure: "Not sure yet", na: "Not applicable", help: "Please help me write this" },
    summarySections: [
      ["brand", "Brand Summary"], ["business", "Business Summary"], ["audience", "Target Audience"],
      ["catalogue", "Product Catalogue"], ["pricing", "Pricing"], ["ordering", "Ordering Process"],
      ["custom", "Custom Orders"], ["payments", "Payments"], ["delivery", "Delivery"],
      ["social", "Social Media"], ["goals", "Website Goals"], ["features", "Required Features"],
      ["content", "Content Requirements"], ["direction", "Brand Direction"], ["competitors", "Competitors"],
      ["policies", "Policies"], ["future", "Future Plans"], ["technical", "Technical Requirements"],
      ["assets", "Assets Available"]
    ],
    sections: []
  };
  const S = (id, title, intro, sum, questions, note) => Q.sections.push({ id, title, intro, sum, note: note || "", questions });

  /* ---------------- 1 ---------------- */
  S("s1", "About Mimah's Atelier", "Let's start with you and your story. There are no wrong answers. Write the way you would speak to a friend; we will shape it into polished website words later.", "business", [
    T("s1_name", "What is the full name of your business?", { required: true, ex: "Mimah's Atelier", sum: "brand" }),
    T("s1_spelling", "How exactly should the name be written?", { help: "Capital letters, apostrophe, spacing: tell us the version you consider correct.", ex: "Mimah's Atelier (not MIMAHS ATELIER)", sum: "brand" }),
    L("s1_nameMeaning", "Does the name have a meaning, or a story behind it?", { help: "Who is Mimah? Why 'Atelier'? Customers love knowing this.", sum: "brand" }),
    T("s1_describe", "In one sentence, how would you describe what your business does?", { required: true, ex: "I make handmade crochet bags and clothing for women who love unique pieces.", canHelp: true }),
    L("s1_howStarted", "How did the business start?", { help: "The moment, the place, the first item you sold." }),
    T("s1_startDate", "When did it start?", { ex: "March 2021, or 'about 3 years ago'" }),
    T("s1_owner", "Who is the founder/owner? What name should appear on the website?", { required: true, ex: "Mimah (first name only) / Full name" }),
    R("s1_team", "Do you make everything yourself?", ["Yes, I make everything myself", "I have helpers or a small team", "I work with other crocheters/artisans", "Other"], { other: true, help: "This helps us write honest, accurate copy such as 'handmade by me' or 'handmade by our team'." }),
    L("s1_crochetStory", "How did you start crocheting? Who taught you, and when did you fall in love with it?"),
    L("s1_inspiration", "What inspired you to turn crochet into a business?"),
    L("s1_special", "What makes your business special or different from other crochet sellers?"),
    L("s1_proud", "What are you most proud of so far?", { ex: "A wedding order, my first 100 customers, a bag that went overseas..." }),
    L("s1_stands", "What does your business stand for?", { canHelp: true }),
    L("s1_mission", "Mission: what are you trying to do for your customers every day?", { help: "No official wording needed. Say it in your own words.", canHelp: true }),
    L("s1_vision", "Vision: what do you hope Mimah's Atelier will become one day?", { canHelp: true }),
    C("s1_values", "Which values describe your business? (choose up to 5)", ["Quality craftsmanship", "Creativity", "Patience and care", "Authenticity", "Uniqueness: no two pieces the same", "Empowering women", "Community", "Zimbabwean/African heritage", "Sustainability", "Kindness", "Excellence", "Affordable beauty"], { other: true, max: 5 }),
    C("s1_feel", "How do you want customers to FEEL when they wear or use your work?", ["Beautiful", "Confident", "Special/unique", "Cozy and comforted", "Elegant", "Proud to support local", "Cared for", "Inspired", "Joyful"], { other: true, sum: "brand" }),
    L("s1_intro", "Short introduction (2–3 sentences) you'd be happy to see on the home page", { help: "A quick 'hello' to a new visitor.", canHelp: true, sum: "content" }),
    L("s1_aboutStory", "Your longer 'About Us' story", { help: "Tell it as a story: where you started, the challenges, what you love, where you're going. A few paragraphs is perfect. Bullet points are fine too.", canHelp: true, sum: "content" })
  ]);

  /* ---------------- 2 ---------------- */
  S("s2", "Brand Identity", "Here we learn how Mimah's Atelier should look and feel: colours, style and personality. Pictures say a lot, so share links to anything you love.", "brand", [
    R("s2_logoOfficial", "Is your current logo the official Mimah's Atelier logo?", ["Yes, it is final", "It is in use but I may change it", "I am still working on it", "Not sure yet"], { required: true }),
    R("s2_logoFile", "Do you have the original, high-quality logo file?", ["Yes, I have the original file(s)", "I only have it as a photo or screenshot", "A designer made it and may have the file", "Not sure what that means: we'll help", "No"], { help: "This is the file the designer gave you, often ending in .png, .ai, .svg, .pdf or .eps. A WhatsApp-compressed picture is not the same thing." }),
    C("s2_logoVersions", "Which versions of the logo exist?", ["Full colour", "White/light version", "Black version", "Icon/symbol only", "Horizontal layout", "Stacked layout", "Only one version", "Not sure"], { other: true }),
    F("s2_logoUpload", "Upload placeholder: logo files", { help: "This prototype stores file names only. You'll send the actual files with the checklist at the end (WhatsApp, email or Drive)." }),
    C("s2_colours", "Which colours do you like for your brand?", ["Lavender", "Soft purple", "Cream", "Warm white", "Gold accents", "Blush pink", "Sage green", "Dusty blue", "Terracotta/earth tones", "Charcoal/black", "Bright and bold colours", "Neutral/natural tones"], { other: true }),
    T("s2_coloursInLogo", "Which colours are in your logo or already used on your pages?", { ex: "Purple and gold. If you know the colour codes, add them (like #7B5EA7).", noChips: false }),
    T("s2_coloursAvoid", "Are there colours you do NOT want?", { ex: "No bright orange, no neon" }),
    C("s2_styleLike", "Which words describe the visual style you like?", ["Elegant", "Feminine", "Luxury", "Handmade", "Minimalist", "Modern", "Playful", "Warm", "Artistic", "Traditional", "African-inspired", "Youthful", "Premium", "Cozy", "Fashion-forward"], { other: true }),
    C("s2_feel", "If you could only pick THREE, how should the brand feel?", ["Elegant", "Feminine", "Luxury", "Handmade", "Minimalist", "Modern", "Playful", "Warm", "Artistic", "Traditional", "African-inspired", "Youthful", "Premium", "Cozy", "Fashion-forward"], { max: 3, required: true }),
    L("s2_styleDislike", "Which styles do you dislike, or never want your brand to look like?", { ex: "Too childish, too corporate, too cluttered, too dark..." }),
    R("s2_type", "Lettering and fonts: which feels most like you?", ["Elegant, classic serif letters", "Clean, modern letters", "Handwritten/script touches", "A mix of elegant and modern", "No preference: choose for me", "Not sure yet"], { sum: "direction" }),
    T("s2_fontsLike", "Do you know a font or lettering style you love, or the one in your logo?", { ex: "The Mimah's Atelier logo uses a script font" }),
    L("s2_inspoLinks", "Share links to websites, Instagram pages, brands or Pinterest boards whose look you love", { help: "Paste links or @handles, one per line.", ex: "@somebrand\nhttps://pinterest.com/..." }),
    L("s2_inspoWhy", "What exactly do you like about them?", { help: "The colours? The photos? How simple it is? How cozy it feels?" }),
    T("s2_words", "What 5 words do you want people to associate with Mimah's Atelier?", { ex: "Handmade, elegant, unique, warm, Zimbabwean" })
  ]);

  /* ---------------- 3 ---------------- */
  const cats = ["Crochet bags", "Dresses", "Tops", "Skirts", "Hats", "Bucket hats", "Scarves", "Shawls", "Cardigans", "Sweaters", "Baby items", "Accessories", "Jewelry", "Home décor", "Blankets", "Decorative pieces", "Keyholders", "Custom pieces"];
  S("s3", "Your Products", "This is the heart of the website. Tell us exactly what you sell today. Please tick only what you really offer. Don't worry about perfect details, start with your most popular items and send the rest later.", "catalogue", [
    C("s3_cats", "Which of these do you currently sell?", cats, { required: true, other: true, help: "Tick everything you currently offer. Leave out anything you don't." }),
    L("s3_otherCats", "Anything else you make that isn't in the list? Anything you plan to add soon?"),
    L("s3_bestsellers", "Which items sell best, or get the most compliments?", { help: "These will probably be featured on the home page." }),
    T("s3_signature", "Do you have a 'signature' piece you're known for?"),
    q("repeater", "s3_list", "Your product list: add one card per product (or per kind of product)", {
      required: true, addLabel: "Add a product", itemLabel: "Product",
      help: "Add at least your 3–5 best sellers now. If you already have a price list or catalogue, skip this and upload it at the end instead (Section 23). 'Not sure' answers are fine: just leave a field blank.",
      fields: [
        { id: "name", label: "Product name", type: "text", ex: "Mini shoulder bag" },
        { id: "category", label: "Category", type: "text", ex: "Bags" },
        { id: "desc", label: "Short description", type: "long" },
        { id: "price", label: "Price", type: "number" },
        { id: "currency", label: "Currency", type: "select", options: ["USD", "ZiG", "ZAR", "Other"] },
        { id: "priceVaries", label: "Is the price fixed or does it vary?", type: "select", options: ["Fixed", "Varies by size", "Varies by colour/yarn", "Varies by complexity", "Quoted per order"] },
        { id: "colours", label: "Colours available", type: "text" },
        { id: "sizes", label: "Sizes", type: "text", ex: "S, M, L or custom measurements" },
        { id: "materials", label: "Materials/yarn", type: "text" },
        { id: "dimensions", label: "Approximate dimensions", type: "text", ex: "25cm × 20cm" },
        { id: "time", label: "Time to make", type: "text", ex: "3–5 days" },
        { id: "stock", label: "Ready-made or made-to-order?", type: "select", options: ["Ready-made (in stock)", "Made-to-order", "Both"] },
        { id: "stockQty", label: "How many in stock (if ready-made)?", type: "number" },
        { id: "custom", label: "Can it be customised?", type: "select", options: ["Yes", "No", "Sometimes"] },
        { id: "customOptions", label: "What can be changed?", type: "text", ex: "Colour, size, name initials" },
        { id: "care", label: "Care instructions", type: "long" },
        { id: "photos", label: "Do you have photos of it?", type: "select", options: ["Yes, good ones", "Yes, but need improving", "No"] },
        { id: "sku", label: "Product code (if you use one)", type: "text" },
        { id: "seasonal", label: "Is it seasonal?", type: "select", options: ["No, all year", "Yes, seasonal"] },
        { id: "show", label: "Show it on the website?", type: "select", options: ["Yes", "No", "Not sure yet"] }
      ]
    }),
    F("s3_upload", "Upload placeholder: price list or product catalogue", { help: "A photo of your list, a spreadsheet, a PDF, anything works. Send the actual file with your assets." }),
    C("s3_priceModel", "How are your prices decided?", ["Fixed price per item", "Changes with size", "Changes with colour or yarn", "Changes with how complex the design is", "Quoted individually for each order"], { other: true, sum: "pricing" }),
    L("s3_priceNotes", "Anything we should know about how your prices work?", { sum: "pricing", ex: "Larger sizes cost extra; textured stitches cost more." }),
    C("s3_yarns", "Which materials do you mainly work with?", ["Cotton", "Mercerised cotton", "Milk cotton", "Acrylic", "Wool", "Raffia/natural fibres", "Polyester", "Blended yarn", "Recycled/upcycled"], { other: true }),
    R("s3_ready", "Is your work mostly…", ["Ready-made (in stock)", "Made-to-order", "A good mix of both"]),
    L("s3_sizeRange", "For clothing: what sizes do you make?", { ex: "XS–XL; I also make to measure" }),
    R("s3_soldOut", "When a product is sold out, what should the website do?", ["Show 'Sold out' and keep it visible", "Show 'Sold out: order a similar one'", "Show 'Available on request'", "Hide it", "Not sure yet", "Not applicable"], { required: false }),
    R("s3_newFreq", "How often do you add new designs?", ["Weekly", "Monthly", "Every few months", "Seasonally", "Irregularly"]),
    L("s3_seasonal", "Are there busy seasons or seasonal collections?", { ex: "December gifts, Mother's Day, winter" }),
    R("s3_stockTrack", "How do you keep track of what you have in stock right now?", ["In my head", "Notebook", "Phone notes", "Spreadsheet", "I make to order, so there is no stock", "Other"], { other: true }),
    T("s3_hidden", "Is there anything you do NOT want shown on the website?", { ex: "Old designs, discounted items" })
  ]);

  /* ---------------- 4 ---------------- */
  S("s4", "Custom Orders", "Custom orders may be a big part of your business. Help us understand exactly how they work today and how you'd love them to work.", "custom", [
    R("s4_accepts", "Do you accept custom crochet orders?", ["Yes, always", "Yes, but only some types or at some times", "No", "Not sure yet"], { required: true }),
    C("s4_types", "What kinds of custom orders do you accept?", ["Bags", "Clothing", "Accessories", "Baby items", "Home décor", "Gifts", "Wedding and event pieces", "Matching sets", "Personalised (names/initials)", "Corporate/branded items", "Recreating a picture the customer brings", "Repairs or alterations"], { other: true, showIf: { id: "s4_accepts", any: ["Yes, always", "Yes, but only some types or at some times"] } }),
    L("s4_current", "How does a customer place a custom order today?", { ex: "They WhatsApp me a picture, I reply with a price, we agree..." }),
    C("s4_info", "What information do you need from a customer before you can quote?", ["Name", "Phone/WhatsApp", "Type of item", "Size or measurements", "Colours", "Reference pictures", "Budget", "Date they need it", "Delivery location", "Occasion or event", "Name/initials to include"], { other: true }),
    R("s4_refImages", "Do customers need to send reference pictures?", ["Yes, always", "Helpful, but not required", "Not needed"]),
    R("s4_colours", "Can customers choose colours?", ["Yes, any colour", "From colours I have available", "No: I choose", "Case by case"]),
    R("s4_sizes", "Can customers choose sizes?", ["Yes, standard sizes", "Yes, to their measurements", "Limited sizes only", "No", "Case by case"]),
    R("s4_original", "Can customers request completely original designs?", ["Yes", "Only variations of my existing designs", "Case by case", "No"]),
    C("s4_priceBasis", "How do you work out the price of a custom order?", ["Time it takes", "Amount of yarn", "Complexity of design", "Size", "How urgent it is", "Fixed prices for each item type"], { other: true, sum: "pricing" }),
    R("s4_quote", "Should customers see a price (or price range) before they send a request?", ["Yes, show 'from' prices", "No, I quote after seeing the details", "Both: 'from' prices, then a final quote", "Not sure yet"], { sum: "pricing" }),
    R("s4_deposit", "Do you ask for a deposit on custom orders?", ["Yes, always", "Only for bigger orders", "No", "Not sure yet"], { required: true, sum: "payments" }),
    N("s4_depositPct", "What deposit percentage?", { suffix: "%", ex: "50", showIf: { id: "s4_deposit", any: ["Yes, always", "Only for bigger orders"] }, sum: "payments" }),
    R("s4_balance", "When is the remaining balance paid?", ["Before I start", "Halfway through", "When it is finished, before delivery", "On collection/delivery", "Other"], { other: true, showIf: { id: "s4_deposit", any: ["Yes, always", "Only for bigger orders"] }, sum: "payments" }),
    T("s4_time", "How long does a custom order usually take?", { ex: "1–2 weeks for bags, 3 weeks for dresses" }),
    N("s4_capacity", "How many custom orders can you handle at the same time?", { ex: "5" }),
    L("s4_changeMind", "What happens if a customer changes their mind after you've started?"),
    L("s4_cancel", "What happens if a customer cancels? (Deposit refundable? Within what time?)"),
    L("s4_cannotComplete", "What happens if you can't complete an order?", { ex: "Illness, yarn unavailable..." }),
    R("s4_rush", "Do you offer rush orders?", ["Yes", "Sometimes", "No"]),
    T("s4_rushFee", "Are rush orders charged extra? How much?", { showIf: { id: "s4_rush", any: ["Yes", "Sometimes"] }, ex: "Yes, 25% extra" }),
    T("s4_min", "Is there a minimum order value or quantity?", { ex: "No minimum / USD 20 minimum" }),
    R("s4_progress", "Would you like to share progress photos with the customer while you work?", ["Yes, always", "Sometimes", "No"]),
    R("s4_approve", "Does the customer approve a sketch/photo/colour plan before you begin?", ["Yes, always", "Sometimes", "No"]),
    q("multitext", "s4_flow", "Describe your IDEAL custom-order process, step by step", {
      help: "Imagine everything running smoothly. What happens at each step? A sentence or two is enough.",
      fields: [
        { id: "idea", label: "1. The customer has an IDEA" }, { id: "request", label: "2. They send a REQUEST" },
        { id: "quote", label: "3. You send a QUOTE" }, { id: "deposit", label: "4. DEPOSIT is paid" },
        { id: "production", label: "5. PRODUCTION (making it)" }, { id: "completion", label: "6. COMPLETION (checking and approving)" },
        { id: "delivery", label: "7. DELIVERY or PICKUP" }
      ]
    }),
    L("s4_example", "Tell us about a recent custom order you were proud of (optional)", { help: "It helps us understand the real thing." })
  ]);

  /* ---------------- 5 ---------------- */
  S("s5", "Pricing & Payments", "How you charge and get paid. We won't assume anything; tick only what you really use or want to use.", "payments", [
    C("s5_currency", "Which currencies do you use for pricing?", ["USD", "ZiG", "ZAR", "Other"], { required: true, other: true, sum: "pricing" }),
    R("s5_showPrices", "Should the website show prices publicly?", ["Yes, show all prices", "Show 'from' prices", "Only 'price on request'", "A mix, depending on the product", "Not sure yet"], { required: true, sum: "pricing" }),
    R("s5_delivery", "Do your prices include delivery?", ["Yes", "No, delivery is extra", "It varies", "Not applicable"], { sum: "pricing" }),
    R("s5_priceChange", "How often do your prices change?", ["Rarely", "A few times a year", "Often (yarn costs, exchange rate)", "Not sure"], { sum: "pricing" }),
    C("s5_methods", "Which payment methods do you accept, or want to accept?", ["Cash", "EcoCash", "OneMoney", "InnBucks", "ZIPIT", "Bank transfer", "Paynow", "Visa/Mastercard", "PayPal", "Pay on delivery/collection"], { required: true, other: true }),
    L("s5_methodsNote", "Anything we should know about how payment works?", { help: "Please do NOT type account or wallet numbers here. We'll collect them securely later.", ex: "Customers send EcoCash then WhatsApp me the confirmation." }),
    R("s5_onlinePay", "Should customers be able to pay on the website itself?", ["Yes, from the start", "Maybe later", "No: payment arranged after enquiry", "Not sure yet"], { sum: "features" }),
    R("s5_receipts", "Do you issue receipts or invoices?", ["Yes, always", "Sometimes, on request", "No", "Would like to start"]),
    R("s5_discounts", "Do you offer discounts?", ["Yes, regularly", "Sometimes", "Never"]),
    C("s5_promos", "Which promotions do you run, or might you run?", ["Seasonal sales", "First-order discount", "Referral rewards", "Bundle deals", "Free delivery over a certain amount", "Loyalty rewards", "Social media giveaways"], { other: true }),
    R("s5_wholesale", "Do you offer wholesale pricing?", ["Yes", "Not yet, but I'd like to", "No"]),
    T("s5_wholesaleDetails", "Wholesale details: minimum quantity, discount, who it's for", { showIf: { id: "s5_wholesale", any: ["Yes", "Not yet, but I'd like to"] } }),
    R("s5_bundles", "Do you sell bundles or sets?", ["Yes", "Would like to", "No"]),
    R("s5_gift", "Gift cards or vouchers?", ["Already offer them", "Would like to offer them", "No"])
  ]);

  /* ---------------- 6 ---------------- */
  S("s6", "Customers & Target Market", "Who buys from you, and why? Think of real customers you've met.", "audience", [
    C("s6_who", "Who are your main customers?", ["Women", "Men", "Children", "Parents", "Couples", "Businesses", "Gift buyers", "Fashion enthusiasts", "Brides and wedding parties", "Event planners/hosts", "Tourists"], { required: true, other: true }),
    C("s6_age", "What age groups buy from you most?", ["Under 18", "18–24", "25–34", "35–44", "45–54", "55+", "Not sure"]),
    C("s6_where", "Where are your customers?", ["Kwekwe", "Other Midlands towns", "Harare", "Bulawayo", "Other Zimbabwean cities/towns", "All over Zimbabwe", "Zimbabweans living abroad", "International customers"], { required: true, other: true }),
    R("s6_budget", "Roughly, what is your customers' budget like?", ["Budget-conscious", "Middle range", "Premium/high-end", "A mix of all", "Not sure"], { sum: "pricing" }),
    L("s6_fashion", "What kind of fashion or style do they love?", { ex: "Boho, church wear, beach wear, trendy streetwear..." }),
    L("s6_habits", "How do they usually shop? When do they buy most?", { ex: "They find me on Instagram, message on WhatsApp, buy at month-end or around holidays." }),
    C("s6_reasons", "Why do customers buy crochet from you?", ["Gifts", "Weddings and special events", "Everyday fashion", "Support local/handmade", "Unique, one-of-a-kind pieces", "Baby showers/new babies", "Home decoration", "Custom designs"], { other: true }),
    L("s6_requests", "What do customers ask you for most often?"),
    L("s6_questions", "What questions do customers ask again and again?", { help: "This becomes the FAQ section and saves you time on WhatsApp.", ex: "How long does it take? Can you do it in another colour? Do you deliver to Harare?" }),
    C("s6_value", "What do your customers value most?", ["Quality", "Uniqueness", "Price", "Speed", "Personal service", "Beautiful finishing", "Being able to customise", "Supporting a local artisan"], { other: true, max: 3 }),
    L("s6_why", "Why do they choose Mimah's Atelier over other options?", { help: "Including cheaper shop-bought items, or other crochet sellers." }),
    R("s6_intl", "Would you like to attract customers outside Zimbabwe?", ["Yes, soon", "Maybe later", "No", "Not sure yet"], { sum: "future" })
  ]);

  /* ---------------- 7 ---------------- */
  S("s7", "Ordering & Customer Communication", "How do customers reach you today, and how would you like it to work on the website?", "ordering", [
    C("s7_channels", "How do customers contact you today?", ["WhatsApp", "WhatsApp Business", "Facebook", "Instagram", "TikTok", "Email", "Phone calls", "Walk-in/in-person"], { required: true, other: true }),
    R("s7_preferred", "Which way do you PREFER customers to contact you?", ["WhatsApp", "Instagram", "Facebook", "Phone call", "Email", "Website form"], { required: true, other: true }),
    q("tel", "s7_whatsapp", "Which WhatsApp number should customers use?", { required: true, ex: "+263 7X XXX XXXX", help: "This will be shown publicly on the website. If you'd rather use a separate business number, tell us in the notes at the end." }),
    R("s7_waType", "Is this a WhatsApp Business account or regular WhatsApp?", ["WhatsApp Business", "Regular WhatsApp", "Not sure"]),
    q("tel", "s7_phone", "Phone number for calls (if different)"),
    q("email", "s7_email", "Email address customers should use", { ex: "hello@..." }),
    C("s7_public", "Which contact details may be shown publicly?", ["WhatsApp number", "Phone number", "Email", "Social media links", "General location (town/suburb)", "Full street address"]),
    R("s7_waOrder", "Do you want a button that opens WhatsApp with the product details already filled in?", ["Yes, definitely", "Maybe", "No", "Not sure what that means: explain it"], { help: "A customer taps 'Order on WhatsApp' under a product, and WhatsApp opens with a message like 'Hi, I'd like the Mini Shoulder Bag in lilac'.", sum: "features" }),
    R("s7_form", "Should customers be able to send you an enquiry through a form on the website?", ["Yes", "No, WhatsApp only", "Not sure yet"], { sum: "features" }),
    C("s7_formTo", "Where should form enquiries be sent?", ["To my email", "To my WhatsApp", "Both", "Saved in a dashboard I can check"], { showIf: { id: "s7_form", any: ["Yes", "Not sure yet"] }, help: "Enquiries sent straight to WhatsApp may need a paid service. We'll advise." }),
    R("s7_autoConfirm", "Do you want customers to get an automatic 'thank you, we got your message' reply?", ["Yes", "No", "Not sure yet"]),
    R("s7_updates", "Do you want customers to receive order updates (e.g. 'Your bag is ready')?", ["Yes, automatically", "I'll send these myself", "No", "Not sure yet"]),
    L("s7_tone", "How do you usually talk to customers? Paste a typical friendly reply you send.", { help: "This helps us match your voice in the website words." }),
    L("s7_social", "Social media accounts: see Section 15.", { noChips: true, readOnly: true })
  ].filter(x => !x.readOnly));

  /* ---------------- 8 ---------------- */
  S("s8", "Delivery, Pickup & Logistics", "How products get from your hands to your customers' hands. You can give a general area instead of a full address.", "delivery", [
    T("s8_base", "Where is your business based?", { required: true, ex: "Kwekwe, Midlands: a town or suburb is fine" }),
    R("s8_place", "Do you have a physical shop or studio?", ["Shop", "Studio (by appointment)", "Home-based", "Market stall/pop-ups", "Online only"], { other: true }),
    R("s8_public", "Should your location be shown on the website?", ["Show full address", "Show area/town only", "Don't show: tell people after they order", "Not sure yet"]),
    T("s8_address", "Public address or area to display (optional)", { help: "Only what you're comfortable with the whole internet seeing." }),
    R("s8_pickup", "Can customers collect their orders?", ["Yes", "By appointment", "No"]),
    L("s8_pickupInfo", "Pickup details: where, when, any rules?", { showIf: { id: "s8_pickup", any: ["Yes", "By appointment"] } }),
    R("s8_deliver", "Do you deliver?", ["Yes", "Sometimes", "No"], { required: true }),
    C("s8_areas", "Where do you deliver?", ["My town only", "Midlands region", "Harare", "Bulawayo", "Nationwide in Zimbabwe", "South Africa", "International"], { other: true, showIf: { id: "s8_deliver", any: ["Yes", "Sometimes"] } }),
    C("s8_how", "How does delivery happen?", ["I deliver myself", "Courier company", "Bus/kombi/pickup point", "Someone I know", "Customer arranges their own"], { other: true, showIf: { id: "s8_deliver", any: ["Yes", "Sometimes"] } }),
    T("s8_couriers", "Which courier or delivery services do you use?"),
    C("s8_fees", "How are delivery fees worked out?", ["Free delivery", "One flat fee", "By area/city", "By weight or size", "Quoted each time", "Customer pays the courier directly"], { other: true }),
    L("s8_feeInfo", "Details on delivery fees", { ex: "Kwekwe free, Harare USD 5 by bus, rest by quote" }),
    R("s8_payer", "Who usually pays for delivery?", ["Customer", "I do", "Shared", "Depends"]),
    T("s8_time", "How long does delivery take?", { ex: "1–2 days in Kwekwe, 3–5 days elsewhere" }),
    R("s8_sameDay", "Do you offer same-day delivery?", ["Yes", "Sometimes", "No"]),
    R("s8_intl", "Do you ship internationally?", ["Yes", "Not yet, but I'd like to", "No"]),
    L("s8_intlInfo", "International shipping details", { showIf: { id: "s8_intl", any: ["Yes", "Not yet, but I'd like to"] } }),
    R("s8_packaging", "How are items packaged?", ["Plain packaging", "Branded or gift packaging", "Not yet decided"], { other: true })
  ]);

  /* ---------------- 9 ---------------- */
  S("s9", "Business Hours & Availability", "So the website can set honest expectations with customers.", "ordering", [
    C("s9_days", "Which days are you available for customers?", ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], { required: true }),
    T("s9_hours", "Opening hours (if you have them)", { ex: "9am–5pm" }),
    T("s9_contactHours", "Best hours for customers to contact you"),
    R("s9_response", "How quickly do you usually reply to messages?", ["Within an hour", "Same day", "Within 24 hours", "Within 2–3 days", "It varies"]),
    L("s9_holidays", "Are you closed or busy on certain holidays or periods?"),
    R("s9_online", "Can customers send orders or enquiries at any time?", ["Yes: I reply during my hours", "I only want orders within business hours", "Not sure yet"]),
    L("s9_production", "Do you make products on specific days?", { ex: "I crochet in the evenings and weekends." }),
    R("s9_breaks", "Do you sometimes close orders (for breaks, or when fully booked)?", ["Yes", "No", "Occasionally"], { help: "The website can show a banner like 'Orders closed until 1 March'." })
  ]);

  /* ---------------- 10 ---------------- */
  S("s10", "Photography & Media", "Your photos will make or break the website. Tell us what you already have.", "assets", [
    X("s10_have", "What do you already have?", ["Plenty", "A few", "None", "Not sure"], [
      ["logo", "Logo"], ["products", "Product photographs"], ["videos", "Videos"], ["bts", "Behind-the-scenes photos"],
      ["owner", "Photos of you"], ["workspace", "Photos of your workspace"], ["customers", "Customer photos"],
      ["social", "Social media content"], ["graphics", "Brand graphics"], ["posters", "Promotional posters"]
    ], { required: true }),
    R("s10_public", "Can all your photos be used publicly on the website?", ["Yes, all", "Some: I'll tell you which", "I'd like to approve each one", "Not sure yet"]),
    R("s10_customerPerm", "Do you have permission to use customers' photos?", ["Yes, from all", "From some", "No", "I haven't asked yet", "Not applicable"]),
    R("s10_submit", "Should customers be able to submit photos of themselves with your items?", ["Yes", "Maybe later", "No"]),
    R("s10_gallery", "Do you want a gallery of your work?", ["Yes", "Maybe", "No"], { sum: "features" }),
    R("s10_insta", "Should your Instagram posts appear on the website?", ["Yes", "Maybe", "No", "Not sure yet"], { sum: "features" }),
    R("s10_watermark", "Would you like your logo as a small watermark on photos?", ["Yes", "No", "Not sure yet"], { help: "It makes it harder for others to copy your photos." }),
    R("s10_ownerPhoto", "Are you comfortable appearing on the website?", ["Yes, happy to", "Maybe a few photos", "Prefer not to", "Not sure yet"]),
    R("s10_camera", "What do you take your photos with?", ["Phone", "Camera", "A photographer", "Mixed"]),
    R("s10_proHelp", "Would you like help planning a professional photo shoot?", ["Yes", "Maybe later", "No"]),
    C("s10_photoStyle", "What photo style do you like?", ["Bright and airy", "Warm and cozy", "Worn by a model or customer", "Neat 'flat-lay' on a plain background", "Dark and moody", "Outdoor/natural settings"], { other: true, sum: "direction" }),
    F("s10_upload", "Upload placeholder: example photos or videos", { help: "Send the actual files with the checklist at the end. Names only are stored here." })
  ]);

  /* ---------------- 11 ---------------- */
  const goals = ["Showcase my work", "Get more customers", "Receive custom orders", "Sell products", "Build credibility", "Build a professional brand", "Reach customers outside my city", "Reach international customers", "Make ordering easier", "Reduce repetitive WhatsApp questions", "Display prices", "Promote new products", "Collect customer reviews"];
  S("s11", "Website Goals", "What should the website do for you?", "goals", [
    C("s11_goals", "What should the website achieve for you?", goals, { required: true, other: true }),
    q("rank", "s11_rank", "Rank your TOP 5 goals, with 1 being most important", { required: true, options: goals, count: 5, help: "Choose one goal for each position." }),
    L("s11_success", "What would make you say the website was a success after 6 months?", { ex: "20 enquiries a month, regular custom orders, customers from Harare..." }),
    T("s11_target", "How many orders or enquiries a month would make you very happy?", { ex: "10 enquiries and 5 orders" }),
    C("s11_measure", "How would you like to measure success?", ["Number of enquiries", "Number of orders", "Sales amount", "Website visitors", "Social media followers", "Customer reviews"], { other: true }),
    L("s11_worries", "What worries you about having a website?", { ex: "Cost, keeping it updated, copying of my designs..." }),
    q("date", "s11_deadline", "Is there a date you'd like the website to be ready by?", { help: "For example before a busy season or event." })
  ]);

  /* ---------------- 12 ---------------- */
  S("s12", "Website Features", "Here's a menu of things a website can do. Tell us which matter to you. If something sounds unfamiliar, read the short explanation, or choose 'Not sure' and we'll talk.", "features", [
    X("s12_features", "For each feature, choose how much you need it", NEED, [
      ["home", "Home page", "The first page people see, with your best work and story."],
      ["catalogue", "Product catalogue", "Pages showing your items, grouped into categories."],
      ["detail", "Product detail pages", "A page for each item with photos, price, sizes and colours."],
      ["search", "Search", "A box where visitors type what they're looking for."],
      ["filter", "Product filtering", "Narrow items by type, colour, size or price."],
      ["cart", "Shopping cart", "Visitors collect several items before paying."],
      ["checkout", "Online checkout", "Customers pay on the website."],
      ["whatsapp", "WhatsApp ordering", "A button that opens WhatsApp with the product details filled in."],
      ["customForm", "Custom-order form", "A guided form where customers describe what they want and upload pictures."],
      ["accounts", "Customer accounts", "Customers log in to see past orders."],
      ["wishlist", "Wishlist", "Customers save favourites for later."],
      ["reviews", "Reviews", "Customers rate and review products."],
      ["testimonials", "Testimonials", "Kind words from happy customers, shown by you."],
      ["gallery", "Gallery", "A beautiful photo showcase of your past work."],
      ["blog", "Blog", "Articles such as crochet tips, stories and news."],
      ["about", "About page", "Your story."],
      ["contact", "Contact page", "Phone, WhatsApp, email, map and form."],
      ["faq", "FAQ", "Answers to common questions."],
      ["deliveryInfo", "Delivery information", "How delivery and pickup work."],
      ["sizeGuide", "Size guide", "Helps customers choose clothing sizes."],
      ["careGuide", "Care guide", "How to wash and care for crochet."],
      ["promos", "Promotions", "Sale banners and special offers."],
      ["codes", "Discount codes", "Codes customers type in to get a discount."],
      ["giftCards", "Gift cards", "Customers buy a gift for someone else."],
      ["newsletter", "Newsletter", "Collect emails to send news and offers."],
      ["instagram", "Instagram integration", "Show your Instagram posts on the site."],
      ["tiktok", "TikTok integration", "Show your TikTok videos on the site."],
      ["booking", "Booking/consultation", "Customers book a time to discuss a design or measurements."],
      ["tracking", "Order tracking", "Customers see where their order is."],
      ["admin", "Admin dashboard", "A private page where you manage everything."],
      ["inventory", "Inventory management", "Keeps count of what's in stock."],
      ["reports", "Sales reporting", "Simple summaries of what sold."],
      ["customers", "Customer management", "A list of your customers and their orders."]
    ], { required: true }),
    T("s12_top3", "If you could only have THREE of these, which would they be?"),
    L("s12_other", "Anything else you'd like the website to do that isn't on the list?"),
    C("s12_lang", "Which language(s) should the website be in?", ["English", "Shona", "Ndebele"], { other: true, sum: "content" })
  ]);

  /* ---------------- 13 ---------------- */
  S("s13", "Website Content", "A website is made of words and pictures. Let us know what you have and what you'd like help with.", "content", [
    X("s13_have", "For each piece of content, tell us where you are", ["Ready", "Needs updating", "Don't have it", "Please help me write it", "Not needed"], [
      ["desc", "Business description"], ["about", "About story"], ["bio", "Founder biography"], ["productDesc", "Product descriptions"],
      ["pricing", "Pricing"], ["faq", "FAQs"], ["delivery", "Delivery policy"], ["returns", "Returns policy"], ["refund", "Refund policy"],
      ["custom", "Custom-order policy"], ["privacy", "Privacy information"], ["terms", "Terms and conditions"], ["contact", "Contact details"],
      ["social", "Social media links"], ["testimonials", "Testimonials"]
    ], { required: true }),
    R("s13_help", "Do you want help writing the website content?", ["Yes, all of it", "Yes, some of it", "No, I'll write it myself", "Not sure yet"], { required: true }),
    C("s13_tone", "How should the website 'sound'?", ["Warm and friendly", "Elegant and polished", "Chatty and personal", "Poetic and gentle", "Short and simple", "Professional", "Playful"], { other: true, max: 3, sum: "direction" }),
    L("s13_words", "Are there words or phrases you always use, or love?", { ex: "'Handcrafted with love', 'one of a kind'" }),
    L("s13_wordsAvoid", "Words you'd rather never see on your website?"),
    L("s13_testimonials", "Paste 3 or more kind things customers have said (optional)", { help: "WhatsApp comments or Instagram messages. Remove phone numbers." }),
    R("s13_testimonialOk", "Do you have permission to show these comments publicly?", ["Yes", "I'll ask them", "Not sure yet", "Not applicable"]),
    C("s13_blog", "If there was a blog, what would you write about?", ["Crochet tips", "Care guides", "Behind-the-scenes", "New collections", "Customer stories", "Style inspiration", "I don't want a blog"], { other: true })
  ]);

  /* ---------------- 14 ---------------- */
  S("s14", "Policies", "Please tell us your REAL rules, not what you think a business 'should' say. We won't invent policies for you; we'll only write down what you decide. Custom-order cancellations are in Section 4.", "policies", [
    R("s14_returns", "Do you accept returns on ready-made items?", ["Yes, for any reason", "Only if faulty or damaged", "Exchanges only", "No returns", "Case by case", "Not sure yet"], { required: true }),
    L("s14_returnsInfo", "Returns details: time allowed, condition, who pays", { canHelp: true }),
    L("s14_exchanges", "Exchanges: how do they work?", { canHelp: true }),
    L("s14_refunds", "Refunds: when are they given and how?", { canHelp: true }),
    L("s14_cancel", "Cancellations (ready-made items): what happens if a customer cancels?"),
    L("s14_damaged", "A product arrives damaged or has a fault: what do you do?"),
    L("s14_incorrect", "The customer receives the wrong item or colour: what then?"),
    L("s14_delivery", "Delivery problems (lost, delayed, courier damage): who is responsible?"),
    L("s14_late", "If an order will be late: what happens, and how are customers told?"),
    L("s14_unclaimed", "Unclaimed orders: how long do you keep them, and then what?"),
    L("s14_care", "Product care: how should customers wash and care for crochet items?", { canHelp: true, ex: "Hand wash cold, dry flat, don't hang." }),
    L("s14_customer", "What are customers responsible for?", { ex: "Giving correct measurements, answering messages promptly, collecting on time." }),
    R("s14_write", "Would you like us to draft these policies in plain language from your answers, for you to approve?", ["Yes", "No, I'll write them", "Not sure yet"])
  ]);

  /* ---------------- 15 ---------------- */
  S("s15", "Social Media", "Where your customers already find you.", "social", [
    q("repeater", "s15_accounts", "Add each social media account", {
      required: true, addLabel: "Add an account", itemLabel: "Account",
      help: "Facebook, Instagram, TikTok, WhatsApp, Pinterest, anything you have or plan to use.",
      fields: [
        { id: "platform", label: "Platform", type: "select", options: ["Instagram", "Facebook", "TikTok", "WhatsApp", "Pinterest", "YouTube", "X (Twitter)", "LinkedIn", "Other"] },
        { id: "username", label: "Username", type: "text", ex: "@mimahsatelier" },
        { id: "link", label: "Link", type: "url" },
        { id: "purpose", label: "What do you use it for?", type: "text", ex: "Showing new work, taking orders" },
        { id: "status", label: "Active?", type: "select", options: ["Very active", "Sometimes", "Inactive", "Planning to start"] },
        { id: "followers", label: "Roughly how many followers?", type: "number" }
      ]
    }),
    R("s15_best", "Which platform brings you the most customers?", ["Instagram", "Facebook", "TikTok", "WhatsApp", "Word of mouth", "Other", "Not sure"], { other: true }),
    R("s15_promote", "Which platform should the website promote the most?", ["Instagram", "Facebook", "TikTok", "WhatsApp", "Other", "Not sure"], { other: true }),
    R("s15_feeds", "Do you want social media feeds shown on the website?", ["Yes", "Maybe", "No"]),
    R("s15_freq", "How often do you post?", ["Daily", "Weekly", "A few times a month", "Rarely"]),
    R("s15_runs", "Who manages your social media?", ["Just me", "Someone helps me", "I'd like help"]),
    T("s15_hashtags", "Hashtags you use for the brand")
  ]);

  /* ---------------- 16 ---------------- */
  S("s16", "Competitors & Inspiration", "Understanding your world helps us make Mimah's Atelier stand out. Paste links or @handles anywhere.", "competitors", [
    L("s16_competitors", "Who do you consider your competitors?", { help: "Other crochet sellers, or shops selling similar items." }),
    L("s16_admired", "Which crochet businesses do you admire?"),
    L("s16_local", "Which local (Zimbabwean) businesses inspire you, in any industry?"),
    L("s16_intl", "Which international brands inspire you?"),
    L("s16_likeSites", "Websites you like (and why)"),
    L("s16_dislikeSites", "Websites you dislike (and why)"),
    L("s16_borrow", "Features you've seen elsewhere that you'd love to have"),
    L("s16_different", "What should make Mimah's Atelier DIFFERENT from all of them?")
  ]);

  /* ---------------- 17 ---------------- */
  S("s17", "The Future of Your Business", "Dream a little. A website should grow with you.", "future", [
    L("s17_1yr", "Where do you want the business to be in 1 year?"),
    L("s17_3yr", "In 3 years?"),
    L("s17_5yr", "In 5 years?"),
    X("s17_plans", "Which of these are you thinking about?", ["Definitely", "Maybe someday", "Not planned", "Not sure"], [
      ["shop", "Opening a physical shop"], ["staff", "Hiring employees"], ["teach", "Teaching crochet"], ["workshops", "Running crochet workshops"],
      ["wholesale", "Selling wholesale"], ["intl", "Selling internationally"], ["other", "Expanding into other handmade products"],
      ["store", "A full online store"], ["fashion", "Building a recognisable fashion brand"], ["collab", "Collaborations with other brands or creatives"],
      ["corporate", "Corporate/custom gifting"]
    ]),
    R("s17_ecomWhen", "If you want an online store, when?", ["From launch", "Within 6 months", "In a year or more", "Not sure", "Not planned"], { sum: "features" })
  ]);

  /* ---------------- 18 ---------------- */
  S("s18", "Admin & Business Management", "A good website also helps you run the business. Tell us what you'd like to control yourself.", "technical", [
    X("s18_manage", "What would you like to manage from a private admin area?", NEED, [
      ["products", "Products"], ["orders", "Orders"], ["customers", "Customers"], ["custom", "Custom requests"], ["inventory", "Inventory/stock"],
      ["prices", "Prices"], ["promos", "Promotions"], ["testimonials", "Testimonials"], ["gallery", "Gallery"], ["content", "Website content"],
      ["messages", "Messages"], ["reports", "Reports"]
    ]),
    N("s18_people", "How many people will manage the website?", { ex: "1" }),
    R("s18_staff", "Will different people need different levels of access (e.g. staff accounts)?", ["Yes", "No, just me", "Maybe later", "Not sure yet"]),
    C("s18_alerts", "How should you be alerted about a new enquiry or order?", ["WhatsApp message", "Email", "SMS", "Notification on the admin page"], { other: true }),
    C("s18_reports", "What would you like to see in reports?", ["Best-selling items", "Money earned", "Orders per month", "Where customers come from", "Custom requests received"], { other: true })
  ]);

  /* ---------------- 19 ---------------- */
  S("s19", "Search Engines & Online Discovery", "How new customers find you on Google. Domain and hosting questions are in Section 21.", "technical", [
    L("s19_search", "What do you think people would type into Google to find you?", { ex: "crochet bags Zimbabwe, handmade crochet Kwekwe" }),
    C("s19_locations", "Which places should be linked with your business?", ["Kwekwe", "Midlands", "Harare", "Bulawayo", "All of Zimbabwe", "Southern Africa", "Worldwide"], { other: true }),
    T("s19_products", "Which products would you most like to be found for?"),
    R("s19_rank", "Would you like to appear when people search 'crochet in Zimbabwe' (and similar)?", ["Yes, nationwide", "Mainly locally", "Internationally too", "Not sure yet"]),
    R("s19_gbp", "Do you have a Google Business Profile (the listing shown on Google Maps)?", ["Yes", "No", "Not sure what that is: please explain"]),
    U("s19_gbpLink", "Link to your Google listing", { showIf: { id: "s19_gbp", any: ["Yes"] } }),
    R("s19_reviews", "Would you like customers to leave reviews on Google?", ["Yes", "No", "Not sure yet"]),
    C("s19_dirs", "Which online listings are you on?", ["Google Maps", "Facebook page", "Instagram", "Local business directories", "None yet"], { other: true })
  ]);

  /* ---------------- 20 ---------------- */
  S("s20", "Legal & Business Information", "Only share what is needed and what you're comfortable with. Please do NOT enter ID numbers, bank details, passwords or other sensitive personal information anywhere in this questionnaire.", "business", [
    R("s20_status", "Is the business formally registered?", ["Yes, registered", "Not registered: I trade informally", "Planning to register", "Prefer not to say", "Not sure"]),
    T("s20_legal", "Registered business name (if registered)", { showIf: { id: "s20_status", any: ["Yes, registered"] } }),
    T("s20_trading", "Trading name (the name customers know)", { ex: "Mimah's Atelier" }),
    T("s20_reg", "Registration number: only if you want it shown on the website", { showIf: { id: "s20_status", any: ["Yes, registered"] } }),
    T("s20_address", "Public business address (only if you want it shown)"),
    R("s20_tax", "Do your prices need to show tax such as VAT?", ["No", "Yes", "Not sure"]),
    R("s20_copy", "Your designs and photos: how do you feel about others using them?", ["All rights reserved. Please ask first", "Sharing is fine with credit to me", "I'd like help deciding", "Not sure"]),
    L("s20_designs", "Do you have concerns about people copying your designs or photos?"),
    L("s20_terms", "Any rules that MUST be in the website's terms and conditions?", { canHelp: true })
  ], "Privacy reminder: the questionnaire is for business information only. Never include ID or passport numbers, bank/wallet numbers, or passwords.");

  /* ---------------- 21 ---------------- */
  S("s21", "Technical & Website Management (beginner-friendly)", "Don't worry if you don't know the answers. 'Not sure yet' is perfectly fine and we'll explain everything.", "technical", [
    R("s21_domain", "Do you already own a web address (domain), like mimahsatelier.com?", ["Yes", "No", "Someone bought it for me", "Not sure what that is"], { required: true, help: "A domain is your website's name on the internet, a bit like a phone number you pay for each year." }),
    T("s21_domainName", "If yes, what is it? If no, what names would you like?", { ex: "mimahsatelier.com, mimahsatelier.co.zw" }),
    R("s21_hosting", "Do you already have website hosting (the 'home' where a website lives)?", ["Yes", "No", "Not sure what that is"]),
    T("s21_hostingProvider", "Which company, if you know?", { showIf: { id: "s21_hosting", any: ["Yes"] } }),
    R("s21_bizEmail", "Do you have a business email address?", ["Yes", "No, I use a personal Gmail etc.", "No, I'd like one", "Not sure"]),
    R("s21_google", "Do you have a Google account?", ["Yes", "No", "Not sure"]),
    R("s21_waBiz", "Do you have WhatsApp Business installed?", ["Yes", "No", "Not sure what that is"]),
    R("s21_manager", "Who should manage the website day to day?", ["Me", "Me, with some help", "Someone else (family/employee)", "The designer, for a monthly fee", "Not sure yet"], { required: true }),
    R("s21_selfAdd", "Do you want to add and edit products yourself?", ["Yes", "Sometimes", "No: someone else will", "Not sure yet"], { required: true }),
    R("s21_training", "Would you like training on how to use it?", ["Yes", "A short guide is enough", "No", "Not sure"]),
    R("s21_maintainer", "Do you have someone who can help maintain the website?", ["Yes", "No", "Not sure"]),
    C("s21_devices", "What will you mostly use to manage the website?", ["Phone", "Laptop/computer", "Tablet"], { required: true }),
    R("s21_comfort", "How comfortable are you with computers and apps?", ["Very comfortable", "Fairly comfortable", "Only the basics", "I'd need a lot of help"]),
    R("s21_internet", "How reliable is your internet where you work?", ["Reliable", "Sometimes unreliable (data bundles, power cuts)", "Often unreliable"]),
    R("s21_customersPhone", "How do most of your customers browse?", ["Mostly phones", "Phones and computers", "Mostly computers", "Not sure"], { help: "This helps us design for phones first, and keep pages light for people with limited data.", sum: "audience" }),
    R("s21_budget", "How are you thinking about the budget for the website and yearly running costs?", ["As low as possible", "Modest: good value", "Flexible: quality comes first", "Not sure yet: I'd like options"], { sum: "technical" }),
    T("s21_budgetNote", "Budget or monthly limit, if you want to share one (optional)", { help: "Domain and hosting have yearly costs. We'll show you options." })
  ]);

  /* ---------------- 22 ---------------- */
  S("s22", "Final Brand Questions", "Almost there. These are the most personal questions, and they often become the most beautiful words on a website.", "brand", [
    L("s22_person", "If Mimah's Atelier were a person, how would you describe her personality?"),
    T("s22_three", "What three words should customers use when describing your brand?"),
    L("s22_never", "What should customers NEVER think when they see your brand?"),
    L("s22_remember", "What is the one thing you want every customer to remember?"),
    L("s22_dreamCustomer", "Who is your dream customer?", { sum: "audience" }),
    L("s22_dreamProduct", "What is your dream product to make?", { sum: "catalogue" }),
    L("s22_dream5", "What would your dream Mimah's Atelier look like in five years?", { sum: "future" }),
    L("s22_complete", "Complete this sentence: “Mimah's Atelier is…”"),
    L("s22_anything", "Is there anything else we should know?", { help: "Worries, ideas, deadlines, things that didn't fit anywhere else." }),
    R("s22_followup", "How would you like us to follow up with you?", ["WhatsApp chat", "Phone call", "Video call", "Email", "In person"], { sum: "ordering" }),
    T("s22_who", "Your name (or the name of the person who filled this in)", { required: true, noChips: true, sum: "business" })
  ]);

  /* ---------------- 23 ---------------- */
  S("s23", "Asset Upload Checklist", "After you finish, please prepare these. Tell us where you are with each. (The prototype can't upload files: send them using the method you choose below.)", "assets", [
    X("s23_assets", "Your asset checklist", ["Ready to send", "Will prepare", "Don't have", "Not needed"], [
      ["logo", "Logo"], ["logoHi", "Original/high-resolution logo"], ["logoAlt", "Other logo versions"], ["products", "Product photos"],
      ["videos", "Product videos"], ["owner", "Owner/founder photo"], ["workspace", "Workspace photos"], ["customers", "Customer photos (with permission)"],
      ["social", "Social media links"], ["priceList", "Product price list"], ["catalogue", "Product catalogue"], ["docs", "Business documents (where appropriate)"],
      ["promo", "Existing promotional material"], ["testimonials", "Testimonials"], ["inspo", "Brand inspiration (links, screenshots, Pinterest board)"], ["other", "Other relevant files"]
    ], { required: true }),
    C("s23_send", "How will you send your files?", ["WhatsApp", "Email", "Google Drive/Dropbox link", "Flash drive/in person", "Not sure yet"], { other: true }),
    F("s23_upload", "Upload placeholder: anything else", { help: "Names only are stored. Send the files separately." }),
    L("s23_notes", "Notes about your files", { ex: "My best photos are on my old phone." })
  ]);

  if (typeof module !== "undefined" && module.exports) module.exports = Q; else window.QUESTIONNAIRE = Q;
})();
