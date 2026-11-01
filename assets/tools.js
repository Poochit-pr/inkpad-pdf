/* Inkpad PDF tools: one shared script for every single-purpose tool page.
   Each page sets <body data-tool="..."> and this file builds the page and runs that tool.
   Everything happens in the browser; files are never uploaded. */
(() => {
'use strict';

const PDFJS_BASE = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
const HEIC_LIB = 'https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js';
pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_BASE + 'pdf.worker.min.js';

/* ---------- icons ---------- */
const sv = (d, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</svg>`;
const ICON = {
  edit: sv('<path d="M15 4l5 5-11 11H4v-5z"/><path d="M13 6l5 5"/>'),
  merge: sv('<path d="M8 3h7l4 4v11H8z"/><path d="M15 3v4h4"/><path d="M4 7v14h11"/>'),
  split: sv('<path d="M6 3h8l4 4v4"/><path d="M6 3v8"/><path d="M6 15v6h12v-6"/><path d="M3 13h2M8 13h2M13 13h2M18 13h3"/>'),
  organize: sv('<rect x="3.5" y="3.5" width="7" height="8" rx="1.2"/><rect x="13.5" y="3.5" width="7" height="8" rx="1.2"/><rect x="3.5" y="14.5" width="7" height="6" rx="1.2"/><path d="M14 17.5h6M17 14.5v6"/>'),
  pdf2jpg: sv('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>'),
  jpg2pdf: sv('<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4"/><path d="M8.5 17.5l2.5-3 2 2 1.5-1.5 2 2.5"/>'),
  watermark: sv('<path d="M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11z"/><path d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5"/>'),
  pagenum: sv('<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4"/><path d="M11 14.5l1.5-1V19M10.5 19h3.5"/>'),
  check: sv('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 'stroke-width="3"'),
  rotL: sv('<path d="M4 4v6h6"/><path d="M4.5 13a8 8 0 1 0 2.3-6.2L4 10"/>'),
  rotR: sv('<path d="M20 4v6h-6"/><path d="M19.5 13a8 8 0 1 1-2.3-6.2L20 10"/>'),
  x: sv('<path d="M6 6l12 12M18 6L6 18"/>'),
  plus: sv('<path d="M12 5v14M5 12h14"/>'),
  download: sv('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'),
  upload: sv('<path d="M12 5v13" /><path d="M6.5 10.5L12 5l5.5 5.5"/>'),
  doc: sv('<path d="M12 5h0"/><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4"/><path d="M12 11v6M9.5 13.5L12 11l2.5 2.5"/>'),
  lock: sv('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
  grid: sv('<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>'),
  ok: sv('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 'stroke-width="2.6"'),
};
const BRAND = `<svg width="32" height="32" viewBox="0 0 34 34" aria-hidden="true"><rect width="34" height="34" rx="9" fill="#2b3fd4"/><path d="M10 7h10l5 5v15H10z" fill="#fff"/><path d="M20 7v5h5" fill="#c9d0ff"/><rect x="12.5" y="17" width="10" height="4" rx="1" fill="#ffe14d"/><path d="M12.5 24.5c2-1.6 3.2-1.6 4 0s2.2 1.6 5.5-.6" stroke="#2b3fd4" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>`;

const TOOLS = [
  { id: 'edit', href: 'index.html' },
  { id: 'merge', href: 'merge-pdf.html' },
  { id: 'split', href: 'split-pdf.html' },
  { id: 'organize', href: 'organize-pdf.html' },
  { id: 'pdf2jpg', href: 'pdf-to-jpg.html' },
  { id: 'jpg2pdf', href: 'jpg-to-pdf.html' },
  { id: 'watermark', href: 'watermark-pdf.html' },
  { id: 'pagenum', href: 'page-numbers-pdf.html' },
];

/* ---------- i18n ---------- */
const I18N = {
  th: {
    allTools: 'เครื่องมือ PDF', moreTools: 'เครื่องมือ PDF อื่น ๆ', howTo: 'วิธีใช้', faq: 'คำถามที่พบบ่อย',
    edit_t: 'แก้ไข & เซ็น PDF', edit_d: 'เพิ่มข้อความ ไฮไลต์ และลายเซ็น',
    merge_t: 'รวมไฟล์ PDF', merge_d: 'รวมหลายไฟล์เป็นไฟล์เดียว เรียงลำดับได้',
    split_t: 'แยกไฟล์ PDF', split_d: 'ดึงหน้าที่ต้องการ หรือแยกเป็นหลายไฟล์',
    organize_t: 'จัดเรียง หมุน ลบหน้า', organize_d: 'ลากสลับหน้า หมุน หรือลบหน้าที่ไม่ใช้',
    pdf2jpg_t: 'PDF เป็น JPG', pdf2jpg_d: 'แปลงหน้า PDF เป็นรูปภาพคมชัด',
    jpg2pdf_t: 'รูปภาพเป็น PDF', jpg2pdf_d: 'รวมรูป JPG PNG HEIC เป็นไฟล์ PDF',
    watermark_t: 'ใส่ลายน้ำ PDF', watermark_d: 'ใส่ข้อความลายน้ำ ภาษาไทยไม่เพี้ยน',
    pagenum_t: 'ใส่เลขหน้า PDF', pagenum_d: 'เพิ่มเลขหน้า เลือกตำแหน่งและรูปแบบได้',
    merge_lead: 'รวมไฟล์ PDF หลายไฟล์เป็นไฟล์เดียวในไม่กี่วินาที ลากการ์ดเพื่อเรียงลำดับก่อนรวม',
    split_lead: 'ดึงเฉพาะหน้าที่ต้องการออกมาเป็นไฟล์ใหม่ แยกตามช่วงหน้า หรือแยกทุกหน้าเป็นไฟล์ละหน้า',
    organize_lead: 'ลากเพื่อสลับลำดับหน้า หมุนหน้าที่กลับด้าน และลบหน้าที่ไม่ต้องการ แล้วบันทึกเป็นไฟล์ใหม่',
    pdf2jpg_lead: 'แปลงหน้า PDF เป็นรูป JPG หรือ PNG เลือกความละเอียดได้ หลายหน้าจะได้เป็นไฟล์ ZIP',
    jpg2pdf_lead: 'รวมรูปถ่าย ภาพสแกน หรือภาพหน้าจอเป็น PDF ไฟล์เดียว รองรับ JPG PNG WebP และ HEIC จาก iPhone',
    watermark_lead: 'ใส่ข้อความลายน้ำ เช่น "สำเนา" หรือ "ใช้เพื่อสมัครงานเท่านั้น" ภาษาไทยแสดงถูกต้อง สระวรรณยุกต์ไม่ลอย',
    pagenum_lead: 'เพิ่มเลขหน้าให้ทุกหน้า เลือกตำแหน่ง รูปแบบ และเลขเริ่มต้นได้ มีรูปแบบ "หน้า 1 จาก 10"',
    dropPdf: 'ลากไฟล์ PDF มาวางที่นี่', dropPdfs: 'ลากไฟล์ PDF มาวางที่นี่ (หลายไฟล์ได้)', dropImg: 'ลากรูปภาพมาวางที่นี่ (หลายรูปได้)',
    orPick: 'หรือเลือกไฟล์จากเครื่องของคุณ', pickPdf: 'เลือกไฟล์ PDF', pickImg: 'เลือกรูปภาพ',
    privacy: 'ไฟล์ไม่ถูกอัปโหลด ประมวลผลในเครื่องคุณทั้งหมด',
    loading: 'กำลังเปิดไฟล์…', working: 'กำลังประมวลผล…', addFiles: 'เพิ่มไฟล์', addImages: 'เพิ่มรูป',
    pages: '{n} หน้า', files: '{n} ไฟล์', page: 'หน้า {n}', selAll: 'เลือกทั้งหมด', selNone: 'ล้างที่เลือก',
    remove: 'ลบ', rotL: 'หมุนซ้าย', rotR: 'หมุนขวา', reset: 'คืนค่าเดิม', dragHint: 'ลากการ์ดเพื่อเปลี่ยนลำดับ', sortName: 'เรียงตามชื่อ',
    doneT: 'เสร็จแล้ว!', doneD: 'ดาวน์โหลด {f} แล้ว ถ้าไม่เห็นไฟล์ กดดาวน์โหลดอีกครั้ง',
    downloadAgain: 'ดาวน์โหลดอีกครั้ง', startOver: 'ทำไฟล์ใหม่',
    errPdf: 'กรุณาเลือกไฟล์ PDF', errImg: 'กรุณาเลือกไฟล์รูปภาพ', errOpen: 'เปิดไฟล์ {f} ไม่ได้', errPw: 'ไฟล์ {f} ตั้งรหัสผ่านไว้ กรุณาปลดรหัสผ่านก่อน',
    errRun: 'ประมวลผลไม่สำเร็จ ไฟล์อาจเสียหายหรือถูกป้องกันการแก้ไข', errRange: 'รูปแบบหน้าไม่ถูกต้อง ตัวอย่าง: 1-3, 5, 8-10', errNone: 'ยังไม่ได้เลือกหน้า',
    footer: 'Inkpad PDF · ทำงานในเบราว์เซอร์ ไฟล์ไม่ออกจากเครื่องคุณ',
    mergeBtn: 'รวม PDF', mergeSum: 'จะได้ PDF {p} หน้า จาก {n} ไฟล์', mergeNeed: 'เพิ่มไฟล์อย่างน้อย 2 ไฟล์เพื่อรวม',
    modeSel: 'ดึงหน้าที่เลือก', modeSelD: 'รวมหน้าที่เลือกเป็นไฟล์เดียว', modeRange: 'แยกตามช่วงหน้า', modeRangeD: 'แต่ละช่วงได้ 1 ไฟล์',
    modeEach: 'แยกทุกหน้า', modeEachD: 'ได้ไฟล์ละ 1 หน้า รวมใน ZIP', pagesLbl: 'หน้าที่เลือก', rangesLbl: 'ช่วงหน้า',
    rangesHint: 'คั่นด้วยจุลภาค เช่น 1-3, 4-8, 9', selHint: 'คลิกหน้าเพื่อเลือก หรือพิมพ์ เช่น 1-3, 5', splitBtn: 'แยก PDF', splitSum: 'จะได้ {n} ไฟล์', selSum: 'เลือกแล้ว {n} หน้า',
    rotAllL: 'หมุนทั้งหมดซ้าย', rotAllR: 'หมุนทั้งหมดขวา', orgSum: '{n} หน้า · หมุน {r} หน้า · ลบ {d} หน้า', saveBtn: 'บันทึก PDF', orgEmpty: 'ต้องเหลืออย่างน้อย 1 หน้า',
    fmt: 'รูปแบบไฟล์', res: 'ความละเอียด', resLow: 'เล็ก 72 dpi', resMid: 'มาตรฐาน 150', resHigh: 'คมชัด 300', convBtn: 'แปลงเป็นรูปภาพ', imgSum: 'จะได้ {n} รูป', progPage: 'หน้า {i} / {n}',
    pageSize: 'ขนาดหน้า', fitImg: 'ตามรูป', orient: 'แนวกระดาษ', auto: 'อัตโนมัติ', portrait: 'แนวตั้ง', landscape: 'แนวนอน',
    margin: 'ระยะขอบ', mNone: 'ไม่มี', mSmall: 'เล็ก', mLarge: 'ใหญ่', makePdf: 'สร้าง PDF', jpgSum: 'จะได้ PDF {n} หน้า', heic: 'กำลังแปลงรูป HEIC…',
    wmText: 'ข้อความลายน้ำ', wmDefault: 'สำเนา', wmSize: 'ขนาด', wmColor: 'สี', wmOpacity: 'ความเข้ม', wmAngle: 'มุม', wmLayout: 'รูปแบบ',
    wmCenter: 'กลางหน้า', wmTile: 'เต็มหน้า', wmBtn: 'ใส่ลายน้ำ', previewNote: 'ตัวอย่างหน้าแรก', wmIdeas: 'ตัวอย่าง',
    pnPos: 'ตำแหน่ง', pnFmt: 'รูปแบบ', pnStart: 'เริ่มที่เลข', pnSize: 'ขนาดตัวอักษร', pnSkip: 'ไม่ใส่เลขที่หน้าแรก (หน้าปก)', pnBtn: 'ใส่เลขหน้า',
    fmtTh: 'หน้า {n} จาก {t}', fmtEn: 'Page {n} of {t}',
    merge_steps: ['<b>เลือกไฟล์ PDF</b> ที่ต้องการรวม ลากมาวางทีเดียวหลายไฟล์ได้', '<b>ลากการ์ด</b> เพื่อเรียงลำดับไฟล์ หรือกด "เรียงตามชื่อ"', 'กด <b>รวม PDF</b> แล้วไฟล์ใหม่จะดาวน์โหลดทันที'],
    split_steps: ['<b>เลือกไฟล์ PDF</b> ที่ต้องการแยก', 'เลือกวิธี: <b>ดึงหน้าที่เลือก</b> แยกตามช่วงหน้า หรือแยกทุกหน้า', 'กด <b>แยก PDF</b> ถ้าได้หลายไฟล์จะรวมมาใน ZIP'],
    organize_steps: ['<b>เลือกไฟล์ PDF</b> ระบบจะแสดงทุกหน้า', '<b>ลาก</b> เพื่อสลับหน้า กดปุ่มหมุนหรือลบที่มุมการ์ด', 'กด <b>บันทึก PDF</b> เพื่อดาวน์โหลดไฟล์ใหม่'],
    pdf2jpg_steps: ['<b>เลือกไฟล์ PDF</b>', 'เลือกหน้าที่ต้องการ รูปแบบ <b>JPG/PNG</b> และความละเอียด', 'กด <b>แปลงเป็นรูปภาพ</b> หลายหน้าจะได้เป็น ZIP'],
    jpg2pdf_steps: ['<b>เลือกรูปภาพ</b> ได้ทีละหลายรูป รวมถึง HEIC จาก iPhone', '<b>ลาก</b> เพื่อเรียงลำดับ เลือกขนาดกระดาษและระยะขอบ', 'กด <b>สร้าง PDF</b> แล้วไฟล์จะดาวน์โหลดทันที'],
    watermark_steps: ['<b>เลือกไฟล์ PDF</b>', 'พิมพ์ <b>ข้อความลายน้ำ</b> ปรับขนาด สี ความเข้ม และมุม ดูผลได้ทันที', 'กด <b>ใส่ลายน้ำ</b> ลายน้ำจะถูกใส่ทุกหน้า'],
    pagenum_steps: ['<b>เลือกไฟล์ PDF</b>', 'เลือก <b>ตำแหน่ง</b> รูปแบบ และเลขเริ่มต้น', 'กด <b>ใส่เลขหน้า</b> แล้วดาวน์โหลดไฟล์ใหม่'],
    q1: 'ไฟล์ของฉันถูกอัปโหลดไปที่ไหนไหม?', a1: 'ไม่มีการอัปโหลด ทุกขั้นตอนทำงานในเบราว์เซอร์ของคุณ ไฟล์ไม่ถูกส่งไปยังเซิร์ฟเวอร์ใด จึงเหมาะกับเอกสารส่วนตัวอย่างสำเนาบัตรหรือสัญญา',
    q2: 'ใช้ฟรีจริงไหม มีจำกัดจำนวนไฟล์หรือเปล่า?', a2: 'ฟรี ไม่ต้องสมัคร ไม่ใส่ลายน้ำของเรา และไม่จำกัดจำนวนครั้ง ขนาดไฟล์ที่รับได้ขึ้นกับหน่วยความจำของอุปกรณ์ ไฟล์ใหญ่หลายร้อย MB อาจช้าบนมือถือ',
    q3: 'ไฟล์ที่ตั้งรหัสผ่านใช้ได้ไหม?', a3: 'ตอนนี้ยังไม่รองรับไฟล์ที่ต้องใส่รหัสผ่านเพื่อเปิด กรุณาปลดรหัสผ่านก่อนใช้งาน',
  },
  en: {
    allTools: 'PDF tools', moreTools: 'More PDF tools', howTo: 'How to use', faq: 'FAQ',
    edit_t: 'Edit & sign PDF', edit_d: 'Add text, highlights and signatures',
    merge_t: 'Merge PDF', merge_d: 'Combine several PDFs into one, in any order',
    split_t: 'Split PDF', split_d: 'Extract pages or split into several files',
    organize_t: 'Organize PDF', organize_d: 'Reorder, rotate or delete pages',
    pdf2jpg_t: 'PDF to JPG', pdf2jpg_d: 'Turn PDF pages into sharp images',
    jpg2pdf_t: 'JPG to PDF', jpg2pdf_d: 'Combine JPG, PNG and HEIC images into a PDF',
    watermark_t: 'Add watermark', watermark_d: 'Stamp text across your pages',
    pagenum_t: 'Add page numbers', pagenum_d: 'Number pages with your choice of position and style',
    merge_lead: 'Combine multiple PDF files into one in seconds. Drag the cards to set the order before merging.',
    split_lead: 'Extract just the pages you need, split by page ranges, or save every page as its own file.',
    organize_lead: 'Drag to reorder pages, rotate the ones that are upside down, delete the rest, and save a new file.',
    pdf2jpg_lead: 'Convert PDF pages to JPG or PNG at the resolution you choose. Several pages download as a ZIP.',
    jpg2pdf_lead: 'Turn photos, scans or screenshots into a single PDF. Supports JPG, PNG, WebP and iPhone HEIC.',
    watermark_lead: 'Add a text watermark such as "COPY" or "CONFIDENTIAL" to every page. Works with Thai and English.',
    pagenum_lead: 'Add page numbers to every page. Choose the position, style and starting number.',
    dropPdf: 'Drop a PDF here', dropPdfs: 'Drop PDF files here (several at once is fine)', dropImg: 'Drop images here (several at once is fine)',
    orPick: 'or pick files from your device', pickPdf: 'Choose PDF', pickImg: 'Choose images',
    privacy: 'Files are never uploaded. Everything runs on your device.',
    loading: 'Opening file…', working: 'Working…', addFiles: 'Add files', addImages: 'Add images',
    pages: '{n} pages', files: '{n} files', page: 'Page {n}', selAll: 'Select all', selNone: 'Clear selection',
    remove: 'Remove', rotL: 'Rotate left', rotR: 'Rotate right', reset: 'Reset', dragHint: 'Drag cards to reorder', sortName: 'Sort by name',
    doneT: 'Done!', doneD: '{f} has been downloaded. If you can’t find it, download it again.',
    downloadAgain: 'Download again', startOver: 'Start over',
    errPdf: 'Please choose a PDF file', errImg: 'Please choose image files', errOpen: 'Could not open {f}', errPw: '{f} is password-protected. Remove the password first.',
    errRun: 'Processing failed. The file may be damaged or protected against editing.', errRange: 'Invalid page format. Example: 1-3, 5, 8-10', errNone: 'No pages selected',
    footer: 'Inkpad PDF · Runs in your browser. Your files never leave your device.',
    mergeBtn: 'Merge PDF', mergeSum: 'Result: {p} pages from {n} files', mergeNeed: 'Add at least 2 files to merge',
    modeSel: 'Extract selected pages', modeSelD: 'Selected pages become one file', modeRange: 'Split by ranges', modeRangeD: 'One file per range',
    modeEach: 'Split every page', modeEachD: 'One file per page, in a ZIP', pagesLbl: 'Selected pages', rangesLbl: 'Page ranges',
    rangesHint: 'Separate with commas, e.g. 1-3, 4-8, 9', selHint: 'Click pages to select, or type e.g. 1-3, 5', splitBtn: 'Split PDF', splitSum: 'Result: {n} files', selSum: '{n} pages selected',
    rotAllL: 'Rotate all left', rotAllR: 'Rotate all right', orgSum: '{n} pages · {r} rotated · {d} deleted', saveBtn: 'Save PDF', orgEmpty: 'Keep at least 1 page',
    fmt: 'Format', res: 'Resolution', resLow: 'Small 72 dpi', resMid: 'Standard 150', resHigh: 'Sharp 300', convBtn: 'Convert to images', imgSum: 'Result: {n} images', progPage: 'Page {i} of {n}',
    pageSize: 'Page size', fitImg: 'Fit image', orient: 'Orientation', auto: 'Auto', portrait: 'Portrait', landscape: 'Landscape',
    margin: 'Margin', mNone: 'None', mSmall: 'Small', mLarge: 'Large', makePdf: 'Create PDF', jpgSum: 'Result: {n}-page PDF', heic: 'Converting HEIC images…',
    wmText: 'Watermark text', wmDefault: 'COPY', wmSize: 'Size', wmColor: 'Color', wmOpacity: 'Opacity', wmAngle: 'Angle', wmLayout: 'Layout',
    wmCenter: 'Center', wmTile: 'Tiled', wmBtn: 'Add watermark', previewNote: 'Preview of page 1', wmIdeas: 'Ideas',
    pnPos: 'Position', pnFmt: 'Style', pnStart: 'Start at', pnSize: 'Font size', pnSkip: 'Skip the first page (cover)', pnBtn: 'Add page numbers',
    fmtTh: 'หน้า {n} จาก {t}', fmtEn: 'Page {n} of {t}',
    merge_steps: ['<b>Choose the PDF files</b> to merge. You can drop several at once.', '<b>Drag the cards</b> to set the order, or sort by name.', 'Click <b>Merge PDF</b> and the new file downloads right away.'],
    split_steps: ['<b>Choose a PDF</b> to split.', 'Pick a method: <b>extract selected pages</b>, split by ranges, or every page.', 'Click <b>Split PDF</b>. Several files arrive as a ZIP.'],
    organize_steps: ['<b>Choose a PDF</b> and every page appears.', '<b>Drag</b> to reorder. Use the corner buttons to rotate or delete.', 'Click <b>Save PDF</b> to download the new file.'],
    pdf2jpg_steps: ['<b>Choose a PDF.</b>', 'Pick the pages, <b>JPG or PNG</b>, and a resolution.', 'Click <b>Convert to images</b>. Several pages arrive as a ZIP.'],
    jpg2pdf_steps: ['<b>Choose images</b>, including iPhone HEIC photos.', '<b>Drag</b> to reorder, then pick page size and margin.', 'Click <b>Create PDF</b> and it downloads right away.'],
    watermark_steps: ['<b>Choose a PDF.</b>', 'Type the <b>watermark text</b> and adjust size, color, opacity and angle with a live preview.', 'Click <b>Add watermark</b> to stamp every page.'],
    pagenum_steps: ['<b>Choose a PDF.</b>', 'Pick the <b>position</b>, style and starting number.', 'Click <b>Add page numbers</b> and download the new file.'],
    q1: 'Are my files uploaded anywhere?', a1: 'No. Every step runs in your browser and files are never sent to a server, so it is safe for private documents such as ID copies or contracts.',
    q2: 'Is it really free? Are there limits?', a2: 'Free, no sign-up, no added watermark and no usage limits. The maximum file size depends on your device’s memory; files of several hundred MB may be slow on phones.',
    q3: 'Can I use password-protected files?', a3: 'Not yet. Please remove the open password before using the tool.',
  },
};
let lang = 'th';
try { lang = localStorage.getItem('inkpad.lang') || (/^th/i.test(navigator.language) ? 'th' : 'en'); } catch (e) {}
const t = (k, vars) => {
  let s = I18N[lang][k] ?? I18N.th[k] ?? k;
  if (vars && typeof s === 'string') for (const v in vars) s = s.split('{' + v + '}').join(vars[v]);
  return s;
};

/* ---------- small helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const baseName = n => n.replace(/\.[^.]+$/, '') || 'document';
const range = n => Array.from({ length: n }, (_, i) => i);
const dpr = Math.min(window.devicePixelRatio || 1, 2);
let uid = 1;

function toast(msg, ms = 3200) {
  const el = $('#toast'); el.textContent = msg; el.hidden = false;
  clearTimeout(toast.tm); toast.tm = setTimeout(() => el.hidden = true, ms);
}
function userError(key, vars) { const e = new Error(key); e.userMsg = t(key, vars); return e; }

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = name;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
async function zipOut(files, name) {
  const zip = new JSZip();
  files.forEach(f => zip.file(f.name, f.data));
  return { blob: await zip.generateAsync({ type: 'blob' }), name };
}
const pdfBlob = bytes => new Blob([bytes], { type: 'application/pdf' });

async function openPdf(file) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  try {
    const pdf = await pdfjsLib.getDocument({
      data: bytes.slice(), cMapUrl: PDFJS_BASE + 'cmaps/', cMapPacked: true, standardFontDataUrl: PDFJS_BASE + 'standard_fonts/',
    }).promise;
    return { id: uid++, name: file.name, bytes, pdf, numPages: pdf.numPages };
  } catch (err) {
    console.error(err);
    toast(t(err && err.name === 'PasswordException' ? 'errPw' : 'errOpen', { f: file.name }), 4500);
    return null;
  }
}
const loadSrc = d => PDFLib.PDFDocument.load(d.bytes, { ignoreEncryption: true });

/* Page thumbnails render one at a time in the background and are cached, so re-rendering a grid reuses them. */
const thumbs = new Map();
let thumbChain = Promise.resolve();
function thumbEl(doc, n, width = 170) {
  const key = `${doc.id}:${n}:${width}`;
  if (thumbs.has(key)) return thumbs.get(key);
  const wrap = document.createElement('span'); wrap.className = 'tw';
  thumbs.set(key, wrap);
  thumbChain = thumbChain.then(async () => {
    const page = await doc.pdf.getPage(n);
    const vp = page.getViewport({ scale: width * dpr / page.getViewport({ scale: 1 }).width });
    const c = document.createElement('canvas'); c.width = Math.floor(vp.width); c.height = Math.floor(vp.height);
    const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
    await page.render({ canvasContext: ctx, viewport: vp }).promise;
    wrap.append(c);
  }).catch(e => console.warn(e));
  return wrap;
}
async function renderPage(doc, n, cssWidth) {
  const page = await doc.pdf.getPage(n);
  const vp1 = page.getViewport({ scale: 1 });
  const vp = page.getViewport({ scale: cssWidth * dpr / vp1.width });
  const c = document.createElement('canvas'); c.width = Math.floor(vp.width); c.height = Math.floor(vp.height);
  const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
  await page.render({ canvasContext: ctx, viewport: vp }).promise;
  return { canvas: c, w: vp1.width, h: vp1.height };
}

/* "1-3, 5" -> [[0,1,2],[4]] (0-based). Throws a user-facing error on bad input. */
function parseRanges(str, max) {
  const parts = String(str).split(/[,;]/).map(s => s.trim()).filter(Boolean);
  if (!parts.length) throw userError('errRange');
  return parts.map(p => {
    const m = p.match(/^(\d+)\s*(?:[-–]\s*(\d+))?$/);
    if (!m) throw userError('errRange');
    let a = +m[1], b = m[2] ? +m[2] : a;
    if (a > b) [a, b] = [b, a];
    if (a < 1 || b > max) throw userError('errRange');
    return range(b - a + 1).map(i => a - 1 + i);
  });
}
function formatRanges(indices) {
  const s = [...new Set(indices)].sort((a, b) => a - b);
  const out = [];
  for (let i = 0; i < s.length; i++) {
    let j = i; while (j + 1 < s.length && s[j + 1] === s[j] + 1) j++;
    out.push(i === j ? `${s[i] + 1}` : `${s[i] + 1}-${s[j] + 1}`);
    i = j;
  }
  return out.join(', ');
}

/* Text is drawn to a canvas and embedded as an image, so Thai vowels and tone marks always render correctly. */
async function textImage(text, { size, color, bold }) {
  const k = 4, weight = bold ? 600 : 400;
  try { await document.fonts.load(`${weight} ${size}px "Sarabun"`, text); } catch (e) {}
  const font = `${weight} ${size * k}px "Sarabun", sans-serif`;
  const c = document.createElement('canvas'), ctx = c.getContext('2d');
  ctx.font = font;
  const pad = size * k * 0.12;
  c.width = Math.ceil(ctx.measureText(text).width + pad * 2); c.height = Math.ceil(size * k * 1.4);
  ctx.font = font; ctx.fillStyle = color; ctx.textBaseline = 'middle';
  ctx.fillText(text, pad, c.height / 2);
  return { url: c.toDataURL('image/png'), w: c.width / k, h: c.height / k };
}
function measureText(text, { size, bold }) {
  const ctx = measureText.ctx || (measureText.ctx = document.createElement('canvas').getContext('2d'));
  ctx.font = `${bold ? 600 : 400} ${size}px "Sarabun", sans-serif`;
  return { w: ctx.measureText(text).width + size * 0.24, h: size * 1.4 };
}
/* Bottom-left corner for an image of w×h rotated by `deg` (counter-clockwise) so its centre lands on (cx, cy). */
function rotatedOrigin(cx, cy, w, h, deg) {
  const r = deg * Math.PI / 180, cos = Math.cos(r), sin = Math.sin(r);
  return { x: cx - (w / 2 * cos - h / 2 * sin), y: cy - (w / 2 * sin + h / 2 * cos) };
}

function sortable(grid, onOrder) {
  if (!window.Sortable) return;
  Sortable.create(grid, {
    animation: 160, ghostClass: 'ghost', filter: '.addcard, .mini', preventOnFilter: false,
    delay: 160, delayOnTouchOnly: true, draggable: '.card',
    onEnd: () => onOrder([...grid.querySelectorAll('.card')].map(c => c.dataset.id)),
  });
}

/* ---------- UI building blocks ---------- */
function card({ id, thumb, label, tools = [], pick = false, selected = false, rotate = 0 }) {
  const el = document.createElement('div');
  el.className = 'card' + (pick ? ' pick' : '') + (selected ? ' sel' : '');
  el.dataset.id = id;
  const th = document.createElement('div'); th.className = 'thumb'; th.append(thumb);
  if (rotate) th.style.transform = `rotate(${rotate}deg)` + (rotate % 180 ? ' scale(.75)' : '');
  const lb = document.createElement('div'); lb.className = 'label'; lb.innerHTML = label;
  el.append(th, lb);
  if (pick) el.insertAdjacentHTML('beforeend', `<span class="check">${ICON.check}</span>`);
  if (tools.length) {
    const box = document.createElement('div'); box.className = 'tools';
    tools.forEach(([icon, title, fn, cls]) => {
      const b = document.createElement('button');
      b.className = 'mini' + (cls ? ' ' + cls : ''); b.type = 'button'; b.title = title; b.setAttribute('aria-label', title); b.innerHTML = ICON[icon];
      b.onclick = e => { e.stopPropagation(); fn(); };
      box.append(b);
    });
    el.append(box);
  }
  return el;
}
function addCard(label) {
  const el = document.createElement('button');
  el.type = 'button'; el.className = 'addcard'; el.innerHTML = `${ICON.plus}<span>${esc(label)}</span>`;
  el.onclick = () => pickFiles(true);
  return el;
}
function segHtml(id, options, value) {
  return `<div class="seg" id="${id}">${options.map(([v, label]) => `<button type="button" data-v="${v}" aria-pressed="${String(v) === String(value)}">${esc(label)}</button>`).join('')}</div>`;
}
function bindSeg(id, fn) {
  const box = $('#' + id); if (!box) return;
  box.querySelectorAll('button').forEach(b => b.onclick = () => {
    box.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    fn(b.dataset.v);
  });
}
function swatchHtml(id, colors, value) {
  return `<div class="swatches" id="${id}">${colors.map(c => `<button type="button" class="sw" data-v="${c}" style="background:${c}" aria-label="${c}" aria-pressed="${c === value}"></button>`).join('')}</div>`;
}
const runHtml = (key, disabled) => `<button class="btn primary lg block" id="runBtn" type="button" ${disabled ? 'disabled' : ''}>${ICON.download}<span>${esc(t(key))}</span></button><div class="progress" hidden><i></i></div>`;
function head(title, meta, actions = []) {
  return `<div class="board-head"><h2>${title}</h2><span class="meta">${meta}</span><div class="actions">${actions.map(([act, label]) => `<button class="btn" type="button" data-act="${act}">${esc(label)}</button>`).join('')}</div></div>`;
}
function onAct(act, fn) { const b = board.querySelector(`[data-act="${act}"]`); if (b) b.onclick = fn; }

/* ---------- tools ---------- */
const S = {};
const IMPL = {};

IMPL.merge = {
  multiple: true, accept: 'pdf',
  init() { S.items = []; },
  ready: () => S.items.length > 0,
  async add(files) { for (const f of files) { const d = await openPdf(f); if (d) S.items.push(d); } },
  render() {
    const total = S.items.reduce((s, d) => s + d.numPages, 0);
    board.innerHTML = head(t('files', { n: S.items.length }), `${t('pages', { n: total })} · ${t('dragHint')}`, [['sort', t('sortName')]]) + '<div class="grid"></div>';
    const grid = $('.grid', board);
    S.items.forEach(d => grid.append(card({
      id: d.id, thumb: thumbEl(d, 1), label: `<b>${esc(d.name)}</b><br>${t('pages', { n: d.numPages })}`,
      tools: [['x', t('remove'), () => { S.items = S.items.filter(x => x !== d); rerender(); }, 'danger']],
    })));
    grid.append(addCard(t('addFiles')));
    sortable(grid, ids => { S.items = ids.map(id => S.items.find(d => String(d.id) === id)); });
    onAct('sort', () => { S.items.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })); rerender(); });
    const ok = S.items.length >= 2;
    side.innerHTML = `<h3>${t('merge_t')}</h3><div class="summary">${ok ? t('mergeSum', { p: total, n: S.items.length }) : t('mergeNeed')}</div>${runHtml('mergeBtn', !ok)}`;
  },
  async run(progress) {
    const out = await PDFLib.PDFDocument.create();
    for (const [i, d] of S.items.entries()) {
      const src = await loadSrc(d);
      (await out.copyPages(src, src.getPageIndices())).forEach(p => out.addPage(p));
      progress((i + 1) / S.items.length);
    }
    return { blob: pdfBlob(await out.save()), name: `${baseName(S.items[0].name)}-merged.pdf` };
  },
};

IMPL.split = {
  accept: 'pdf',
  init() { S.doc = null; S.sel = new Set(); S.mode = 'sel'; S.ranges = ''; },
  ready: () => !!S.doc,
  async add(files) {
    const d = await openPdf(files[0]); if (!d) return;
    S.doc = d; S.sel = new Set();
    const n = d.numPages, half = Math.ceil(n / 2);
    S.ranges = n > 1 ? `1-${half}, ${half + 1}-${n}` : '1';
  },
  groups() {
    const n = S.doc.numPages;
    if (S.mode === 'sel') { if (!S.sel.size) throw userError('errNone'); return [[...S.sel].sort((a, b) => a - b)]; }
    if (S.mode === 'range') return parseRanges(S.ranges, n);
    return range(n).map(i => [i]);
  },
  summary() {
    if (S.mode === 'sel') return t('selSum', { n: S.sel.size });
    try { return t('splitSum', { n: this.groups().length }); } catch (e) { return e.userMsg; }
  },
  render() {
    const d = S.doc, pick = S.mode === 'sel';
    board.innerHTML = head(esc(d.name), t('pages', { n: d.numPages }), pick ? [['all', t('selAll')], ['none', t('selNone')]] : []) + '<div class="grid"></div>';
    const grid = $('.grid', board);
    range(d.numPages).forEach(i => {
      const c = card({ id: i, thumb: thumbEl(d, i + 1), label: t('page', { n: i + 1 }), pick, selected: pick && S.sel.has(i) });
      if (pick) c.onclick = () => { S.sel.has(i) ? S.sel.delete(i) : S.sel.add(i); c.classList.toggle('sel'); syncSel(); };
      grid.append(c);
    });
    onAct('all', () => { S.sel = new Set(range(d.numPages)); rerender(); });
    onAct('none', () => { S.sel.clear(); rerender(); });
    const radio = (v, title, desc) => `<label class="radio"><input type="radio" name="mode" value="${v}" ${S.mode === v ? 'checked' : ''}><div><b>${title}</b><span>${desc}</span></div></label>`;
    side.innerHTML = `<h3>${t('split_t')}</h3>
      <div class="radios">${radio('sel', t('modeSel'), t('modeSelD'))}${radio('range', t('modeRange'), t('modeRangeD'))}${radio('each', t('modeEach'), t('modeEachD'))}</div>
      ${S.mode === 'sel' ? `<div class="field"><span class="lbl">${t('pagesLbl')}</span><input type="text" id="selIn" value="${esc(formatRanges([...S.sel]))}" placeholder="1-3, 5" inputmode="numeric"><span class="hint">${t('selHint')}</span></div>` : ''}
      ${S.mode === 'range' ? `<div class="field"><span class="lbl">${t('rangesLbl')}</span><input type="text" id="rangeIn" value="${esc(S.ranges)}" inputmode="numeric"><span class="hint">${t('rangesHint')}</span></div>` : ''}
      <div class="summary" id="sum">${esc(this.summary())}</div>${runHtml('splitBtn')}`;
    side.querySelectorAll('input[name=mode]').forEach(r => r.onchange = () => { S.mode = r.value; rerender(); });
    const syncSel = () => { const i = $('#selIn'); if (i) i.value = formatRanges([...S.sel]); $('#sum').textContent = this.summary(); };
    const selIn = $('#selIn');
    if (selIn) selIn.onchange = () => {
      try { S.sel = new Set(selIn.value.trim() ? parseRanges(selIn.value, d.numPages).flat() : []); rerender(); }
      catch (e) { toast(e.userMsg); }
    };
    const rangeIn = $('#rangeIn');
    if (rangeIn) rangeIn.oninput = () => { S.ranges = rangeIn.value; $('#sum').textContent = this.summary(); };
  },
  async run(progress) {
    const groups = this.groups();
    const src = await loadSrc(S.doc), base = baseName(S.doc.name), outs = [];
    for (const [i, g] of groups.entries()) {
      const doc = await PDFLib.PDFDocument.create();
      (await doc.copyPages(src, g)).forEach(p => doc.addPage(p));
      outs.push({ name: `${base}-${formatRanges(g).replace(/, /g, '_')}.pdf`, data: await doc.save() });
      progress((i + 1) / groups.length);
    }
    if (outs.length === 1) return { blob: pdfBlob(outs[0].data), name: outs[0].name };
    return zipOut(outs, `${base}-split.zip`);
  },
};

IMPL.organize = {
  accept: 'pdf',
  init() { S.doc = null; S.pages = []; },
  ready: () => !!S.doc,
  async add(files) {
    const d = await openPdf(files[0]); if (!d) return;
    S.doc = d; this.reset();
  },
  reset() { S.pages = range(S.doc.numPages).map(i => ({ id: i, idx: i, rot: 0 })); },
  render() {
    const d = S.doc;
    board.innerHTML = head(esc(d.name), `${t('pages', { n: S.pages.length })} · ${t('dragHint')}`,
      [['rotL', t('rotAllL')], ['rotR', t('rotAllR')], ['reset', t('reset')]]) + '<div class="grid"></div>';
    const grid = $('.grid', board);
    S.pages.forEach(p => grid.append(card({
      id: p.id, thumb: thumbEl(d, p.idx + 1), label: t('page', { n: p.idx + 1 }), rotate: p.rot,
      tools: [
        ['rotL', t('rotL'), () => { p.rot = (p.rot + 270) % 360; rerender(); }],
        ['rotR', t('rotR'), () => { p.rot = (p.rot + 90) % 360; rerender(); }],
        ['x', t('remove'), () => { S.pages = S.pages.filter(x => x !== p); rerender(); }, 'danger'],
      ],
    })));
    sortable(grid, ids => { S.pages = ids.map(id => S.pages.find(p => String(p.id) === id)); });
    onAct('rotL', () => { S.pages.forEach(p => p.rot = (p.rot + 270) % 360); rerender(); });
    onAct('rotR', () => { S.pages.forEach(p => p.rot = (p.rot + 90) % 360); rerender(); });
    onAct('reset', () => { this.reset(); rerender(); });
    const r = S.pages.filter(p => p.rot).length, del = d.numPages - S.pages.length;
    side.innerHTML = `<h3>${t('organize_t')}</h3><div class="summary">${t('orgSum', { n: S.pages.length, r, d: del })}</div>${runHtml('saveBtn', !S.pages.length)}`;
  },
  async run(progress) {
    if (!S.pages.length) throw userError('orgEmpty');
    const src = await loadSrc(S.doc), out = await PDFLib.PDFDocument.create();
    const copied = await out.copyPages(src, S.pages.map(p => p.idx));
    copied.forEach((page, i) => {
      const rot = S.pages[i].rot;
      if (rot) page.setRotation(PDFLib.degrees((page.getRotation().angle + rot) % 360));
      out.addPage(page);
    });
    progress(1);
    return { blob: pdfBlob(await out.save()), name: `${baseName(S.doc.name)}-organized.pdf` };
  },
};

IMPL.pdf2jpg = {
  accept: 'pdf',
  init() { S.doc = null; S.sel = new Set(); S.fmt = 'jpg'; S.dpi = 150; },
  ready: () => !!S.doc,
  async add(files) {
    const d = await openPdf(files[0]); if (!d) return;
    S.doc = d; S.sel = new Set(range(d.numPages));
  },
  render() {
    const d = S.doc;
    board.innerHTML = head(esc(d.name), t('pages', { n: d.numPages }), [['all', t('selAll')], ['none', t('selNone')]]) + '<div class="grid"></div>';
    const grid = $('.grid', board);
    const sum = () => { const s = $('#sum'); if (s) s.textContent = t('imgSum', { n: S.sel.size }); $('#runBtn').disabled = !S.sel.size; };
    range(d.numPages).forEach(i => {
      const c = card({ id: i, thumb: thumbEl(d, i + 1), label: t('page', { n: i + 1 }), pick: true, selected: S.sel.has(i) });
      c.onclick = () => { S.sel.has(i) ? S.sel.delete(i) : S.sel.add(i); c.classList.toggle('sel'); sum(); };
      grid.append(c);
    });
    onAct('all', () => { S.sel = new Set(range(d.numPages)); rerender(); });
    onAct('none', () => { S.sel.clear(); rerender(); });
    side.innerHTML = `<h3>${t('pdf2jpg_t')}</h3>
      <div class="field"><span class="lbl">${t('fmt')}</span>${segHtml('fmtSeg', [['jpg', 'JPG'], ['png', 'PNG']], S.fmt)}</div>
      <div class="field"><span class="lbl">${t('res')}</span>${segHtml('dpiSeg', [[72, t('resLow')], [150, t('resMid')], [300, t('resHigh')]], S.dpi)}</div>
      <div class="summary" id="sum">${t('imgSum', { n: S.sel.size })}</div>${runHtml('convBtn', !S.sel.size)}`;
    bindSeg('fmtSeg', v => S.fmt = v);
    bindSeg('dpiSeg', v => S.dpi = +v);
  },
  async run(progress) {
    const pages = [...S.sel].sort((a, b) => a - b);
    if (!pages.length) throw userError('errNone');
    const base = baseName(S.doc.name), mime = S.fmt === 'png' ? 'image/png' : 'image/jpeg', outs = [];
    const c = document.createElement('canvas'), ctx = c.getContext('2d');
    for (const [k, i] of pages.entries()) {
      progress(k / pages.length, t('progPage', { i: k + 1, n: pages.length }));
      const page = await S.doc.pdf.getPage(i + 1);
      const vp = page.getViewport({ scale: S.dpi / 72 });
      c.width = Math.floor(vp.width); c.height = Math.floor(vp.height);
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
      await page.render({ canvasContext: ctx, viewport: vp }).promise;
      const blob = await new Promise(r => c.toBlob(r, mime, 0.92));
      outs.push({ name: `${base}-page-${i + 1}.${S.fmt}`, data: blob });
    }
    c.width = c.height = 0;
    progress(1);
    if (outs.length === 1) return { blob: outs[0].data, name: outs[0].name };
    return zipOut(outs, `${base}-images.zip`);
  },
};

const PAGE_SIZES = { a4: [595.28, 841.89], letter: [612, 792] };
const isHeic = f => /image\/hei[cf]/i.test(f.type) || /\.hei[cf]$/i.test(f.name);
function loadScript(src) {
  return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.append(s); });
}
IMPL.jpg2pdf = {
  multiple: true, accept: 'image',
  init() { S.items = []; S.size = 'a4'; S.orient = 'auto'; S.margin = 20; },
  ready: () => S.items.length > 0,
  async add(files) {
    for (const f of files) {
      try {
        let blob = f;
        if (isHeic(f)) {
          toast(t('heic'));
          if (!window.heic2any) await loadScript(HEIC_LIB);
          const r = await heic2any({ blob: f, toType: 'image/jpeg', quality: 0.92 });
          blob = Array.isArray(r) ? r[0] : r;
        }
        const bmp = await createImageBitmap(blob, { imageOrientation: 'from-image' });
        const img = new Image(); img.alt = ''; img.src = URL.createObjectURL(blob);
        S.items.push({ id: uid++, name: f.name, blob, img, w: bmp.width, h: bmp.height });
        bmp.close();
      } catch (e) { console.error(e); toast(t('errOpen', { f: f.name })); }
    }
  },
  render() {
    board.innerHTML = head(t('files', { n: S.items.length }), t('dragHint'), [['sort', t('sortName')]]) + '<div class="grid"></div>';
    const grid = $('.grid', board);
    S.items.forEach(it => grid.append(card({
      id: it.id, thumb: it.img, label: `<b>${esc(it.name)}</b>`,
      tools: [['x', t('remove'), () => { S.items = S.items.filter(x => x !== it); URL.revokeObjectURL(it.img.src); rerender(); }, 'danger']],
    })));
    grid.append(addCard(t('addImages')));
    sortable(grid, ids => { S.items = ids.map(id => S.items.find(x => String(x.id) === id)); });
    onAct('sort', () => { S.items.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })); rerender(); });
    side.innerHTML = `<h3>${t('jpg2pdf_t')}</h3>
      <div class="field"><span class="lbl">${t('pageSize')}</span>${segHtml('sizeSeg', [['a4', 'A4'], ['letter', 'Letter'], ['fit', t('fitImg')]], S.size)}</div>
      <div class="field" id="orientField" ${S.size === 'fit' ? 'hidden' : ''}><span class="lbl">${t('orient')}</span>${segHtml('orientSeg', [['auto', t('auto')], ['portrait', t('portrait')], ['landscape', t('landscape')]], S.orient)}</div>
      <div class="field"><span class="lbl">${t('margin')}</span>${segHtml('marginSeg', [[0, t('mNone')], [20, t('mSmall')], [40, t('mLarge')]], S.margin)}</div>
      <div class="summary">${t('jpgSum', { n: S.items.length })}</div>${runHtml('makePdf', !S.items.length)}`;
    bindSeg('sizeSeg', v => { S.size = v; $('#orientField').hidden = v === 'fit'; });
    bindSeg('orientSeg', v => S.orient = v);
    bindSeg('marginSeg', v => S.margin = +v);
  },
  async run(progress) {
    const doc = await PDFLib.PDFDocument.create(), m = S.margin;
    for (const [i, it] of S.items.entries()) {
      let img;
      if (it.blob.type === 'image/png') img = await doc.embedPng(await it.blob.arrayBuffer());
      else {
        // Re-encode through a canvas so phone photos keep their EXIF orientation and transparent areas turn white.
        const bmp = await createImageBitmap(it.blob, { imageOrientation: 'from-image' });
        const c = document.createElement('canvas'); c.width = bmp.width; c.height = bmp.height;
        const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(bmp, 0, 0); bmp.close();
        const jpg = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.92));
        img = await doc.embedJpg(await jpg.arrayBuffer());
        c.width = c.height = 0;
      }
      let pw, ph;
      if (S.size === 'fit') { pw = img.width * 0.75 + m * 2; ph = img.height * 0.75 + m * 2; }
      else {
        [pw, ph] = PAGE_SIZES[S.size];
        const land = S.orient === 'landscape' || (S.orient === 'auto' && img.width > img.height);
        if (land) [pw, ph] = [ph, pw];
      }
      const scale = Math.min((pw - m * 2) / img.width, (ph - m * 2) / img.height);
      const w = img.width * scale, h = img.height * scale;
      doc.addPage([pw, ph]).drawImage(img, { x: (pw - w) / 2, y: (ph - h) / 2, width: w, height: h });
      progress((i + 1) / S.items.length);
    }
    return { blob: pdfBlob(await doc.save()), name: `${baseName(S.items[0].name)}.pdf` };
  },
};

/* Watermark and page-number tools share a live preview of one page. */
/* The box is usable as soon as the page size is known; the page image fills in when rendering finishes. */
function previewBox(pageNo) {
  const box = document.createElement('div'); box.className = 'preview';
  const ov = document.createElement('div'); ov.className = 'overlay';
  box.append(ov);
  const pv = { box, ov, w: 0, h: 0 };
  pv.sized = S.doc.pdf.getPage(pageNo).then(page => {
    const vp = page.getViewport({ scale: 1 });
    pv.w = vp.width; pv.h = vp.height; box.style.aspectRatio = `${vp.width} / ${vp.height}`;
  });
  const key = `${S.doc.id}:${pageNo}`;
  if (!S.previews) S.previews = {};
  if (!S.previews[key]) S.previews[key] = renderPage(S.doc, pageNo, 420);
  S.previews[key].then(r => {
    const c = document.createElement('canvas'); c.width = r.canvas.width; c.height = r.canvas.height;
    c.getContext('2d').drawImage(r.canvas, 0, 0);
    box.prepend(c);
  }).catch(e => console.warn(e));
  return pv;
}
function overlayText(ov, text, { left, top, size, color, opacity = 1, angle = 0, center = false, bold = false }) {
  const s = document.createElement('span');
  Object.assign(s.style, {
    position: 'absolute', left: left + 'px', top: top + 'px', fontSize: size + 'px', lineHeight: 1.4, color, opacity,
    fontFamily: '"Sarabun", sans-serif', fontWeight: bold ? 600 : 400, whiteSpace: 'nowrap', padding: `0 ${size * 0.12}px`,
    transform: (center ? 'translate(-50%, -50%) ' : '') + (angle ? `rotate(${-angle}deg)` : ''),
  });
  s.textContent = text;
  ov.append(s);
}

const WM_COLORS = ['#6b7280', '#c0262d', '#1d3fbb', '#111111'];
function wmLayout(W, H, w, h, angle, mode) {
  if (mode === 'center') return [[W / 2, H / 2]];
  const r = angle * Math.PI / 180;
  const bw = Math.abs(w * Math.cos(r)) + Math.abs(h * Math.sin(r)), bh = Math.abs(w * Math.sin(r)) + Math.abs(h * Math.cos(r));
  const sx = bw + Math.max(36, w * 0.25), sy = bh + 36, pts = [];
  for (let y = sy / 2, row = 0; y < H + sy / 2; y += sy, row++)
    for (let x = (row % 2 ? sx : sx / 2) - sx; x < W + sx; x += sx) pts.push([x, y]);
  return pts;
}
IMPL.watermark = {
  accept: 'pdf',
  init() { S.doc = null; S.text = null; S.size = 56; S.color = WM_COLORS[0]; S.opacity = 0.3; S.angle = 45; S.layout = 'center'; },
  ready: () => !!S.doc,
  async add(files) { const d = await openPdf(files[0]); if (d) S.doc = d; },
  render() {
    if (S.text == null) S.text = t('wmDefault');
    const d = S.doc;
    board.innerHTML = head(esc(d.name), `${t('pages', { n: d.numPages })} · ${t('previewNote')}`);
    side.innerHTML = `<h3>${t('watermark_t')}</h3>
      <div class="field"><span class="lbl">${t('wmText')}</span><input type="text" id="wmText" value="${esc(S.text)}" maxlength="80">
        <span class="hint">${t('wmIdeas')}: ${['สำเนาถูกต้อง', 'ใช้เพื่อสมัครงานเท่านั้น', 'CONFIDENTIAL', 'DRAFT'].map(x => `<button type="button" class="linkbtn" data-idea="${esc(x)}">${esc(x)}</button>`).join(' · ')}</span></div>
      <div class="field"><span class="lbl">${t('wmSize')} <output id="sizeOut">${S.size}</output> pt</span><input type="range" id="wmSize" min="16" max="120" value="${S.size}"></div>
      <div class="field"><span class="lbl">${t('wmColor')}</span>${swatchHtml('wmColor', WM_COLORS, S.color)}</div>
      <div class="field"><span class="lbl">${t('wmOpacity')} <output id="opOut">${Math.round(S.opacity * 100)}</output>%</span><input type="range" id="wmOp" min="10" max="90" value="${Math.round(S.opacity * 100)}"></div>
      <div class="field"><span class="lbl">${t('wmAngle')}</span>${segHtml('angleSeg', [[0, '0°'], [45, '45°'], [-45, '−45°']], S.angle)}</div>
      <div class="field"><span class="lbl">${t('wmLayout')}</span>${segHtml('layoutSeg', [['center', t('wmCenter')], ['tile', t('wmTile')]], S.layout)}</div>
      ${runHtml('wmBtn', !S.text.trim())}`;
    const upd = () => { this.paint(); $('#runBtn').disabled = !S.text.trim(); };
    $('#wmText').oninput = e => { S.text = e.target.value; upd(); };
    side.querySelectorAll('[data-idea]').forEach(b => b.onclick = () => { S.text = b.dataset.idea; $('#wmText').value = S.text; upd(); });
    $('#wmSize').oninput = e => { S.size = +e.target.value; $('#sizeOut').textContent = S.size; upd(); };
    $('#wmOp').oninput = e => { S.opacity = e.target.value / 100; $('#opOut').textContent = e.target.value; upd(); };
    $('#wmColor').querySelectorAll('.sw').forEach(b => b.onclick = () => {
      S.color = b.dataset.v; $('#wmColor').querySelectorAll('.sw').forEach(x => x.setAttribute('aria-pressed', String(x === b))); upd();
    });
    bindSeg('angleSeg', v => { S.angle = +v; upd(); });
    bindSeg('layoutSeg', v => { S.layout = v; upd(); });
    this.pv = previewBox(1);
    board.append(this.pv.box);
    this.pv.sized.then(() => this.paint());
  },
  paint() {
    const pv = this.pv; if (!pv || !pv.w) return;
    pv.ov.innerHTML = '';
    if (!S.text.trim()) return;
    const sf = pv.box.clientWidth / pv.w;
    const { w, h } = measureText(S.text, { size: S.size, bold: true });
    wmLayout(pv.w, pv.h, w, h, S.angle, S.layout).forEach(([cx, cy]) => overlayText(pv.ov, S.text, {
      left: cx * sf, top: (pv.h - cy) * sf, size: S.size * sf, color: S.color, opacity: S.opacity, angle: S.angle, center: true, bold: true,
    }));
  },
  async run(progress) {
    const doc = await loadSrc(S.doc);
    const ti = await textImage(S.text.trim(), { size: S.size, color: S.color, bold: true });
    const img = await doc.embedPng(ti.url);
    const pages = doc.getPages();
    pages.forEach((page, i) => {
      const { width: W, height: H } = page.getSize();
      wmLayout(W, H, ti.w, ti.h, S.angle, S.layout).forEach(([cx, cy]) => {
        const o = rotatedOrigin(cx, cy, ti.w, ti.h, S.angle);
        page.drawImage(img, { x: o.x, y: o.y, width: ti.w, height: ti.h, rotate: PDFLib.degrees(S.angle), opacity: S.opacity });
      });
      progress((i + 1) / pages.length);
    });
    return { blob: pdfBlob(await doc.save()), name: `${baseName(S.doc.name)}-watermarked.pdf` };
  },
};

const PN_POS = ['tl', 'tc', 'tr', '', '', '', 'bl', 'bc', 'br'];
IMPL.pagenum = {
  accept: 'pdf',
  init() { S.doc = null; S.pos = 'bc'; S.fmt = 'n'; S.start = 1; S.size = 11; S.skip = false; },
  ready: () => !!S.doc,
  async add(files) { const d = await openPdf(files[0]); if (d) S.doc = d; },
  label(i) {
    const first = S.skip ? 1 : 0, count = S.doc.numPages - first;
    const n = S.start + i - first, total = S.start + count - 1;
    return { n: `${n}`, slash: `${n} / ${total}`, th: `หน้า ${n} จาก ${total}`, en: `Page ${n} of ${total}` }[S.fmt];
  },
  place(W, H, w, h) {
    const m = 28, v = S.pos[0], hz = S.pos[1];
    return { x: hz === 'l' ? m : hz === 'c' ? (W - w) / 2 : W - m - w, y: v === 'b' ? m : H - m - h };
  },
  render() {
    const d = S.doc;
    board.innerHTML = head(esc(d.name), `${t('pages', { n: d.numPages })} · ${t('previewNote')}`);
    const n1 = S.start, ex = Math.max(d.numPages + S.start - 1, 1);
    side.innerHTML = `<h3>${t('pagenum_t')}</h3>
      <div class="field"><span class="lbl">${t('pnPos')}</span><div class="posgrid" id="posGrid">${PN_POS.map(p => `<button type="button" data-v="${p}" aria-pressed="${p === S.pos}" aria-label="${p}"></button>`).join('')}</div></div>
      <div class="field"><span class="lbl">${t('pnFmt')}</span><select id="pnFmt">
        <option value="n">${n1}</option><option value="slash">${n1} / ${ex}</option>
        <option value="th">หน้า ${n1} จาก ${ex}</option><option value="en">Page ${n1} of ${ex}</option></select></div>
      <div class="field"><span class="lbl">${t('pnStart')}</span><input type="number" id="pnStart" min="0" max="9999" value="${S.start}"></div>
      <div class="field"><span class="lbl">${t('pnSize')} <output id="pnSizeOut">${S.size}</output> pt</span><input type="range" id="pnSize" min="7" max="24" value="${S.size}"></div>
      <label class="checkline"><input type="checkbox" id="pnSkip" ${S.skip ? 'checked' : ''} ${d.numPages < 2 ? 'disabled' : ''}> ${t('pnSkip')}</label>
      ${runHtml('pnBtn')}`;
    $('#pnFmt').value = S.fmt;
    $('#posGrid').querySelectorAll('button').forEach(b => b.onclick = () => {
      S.pos = b.dataset.v; $('#posGrid').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); this.paint();
    });
    $('#pnFmt').onchange = e => { S.fmt = e.target.value; this.paint(); };
    $('#pnStart').onchange = e => { S.start = Math.max(0, parseInt(e.target.value, 10) || 0); rerender(); };
    $('#pnSize').oninput = e => { S.size = +e.target.value; $('#pnSizeOut').textContent = S.size; this.paint(); };
    $('#pnSkip').onchange = e => { S.skip = e.target.checked; rerender(); };
    const pageIdx = S.skip && d.numPages > 1 ? 1 : 0;
    this.pv = previewBox(pageIdx + 1);
    this.pv.idx = pageIdx;
    board.append(this.pv.box);
    this.pv.sized.then(() => this.paint());
  },
  paint() {
    const pv = this.pv; if (!pv || !pv.w) return;
    pv.ov.innerHTML = '';
    const text = this.label(pv.idx), sf = pv.box.clientWidth / pv.w;
    const { w, h } = measureText(text, { size: S.size });
    const p = this.place(pv.w, pv.h, w, h);
    overlayText(pv.ov, text, { left: p.x * sf, top: (pv.h - p.y - h) * sf, size: S.size * sf, color: '#222' });
  },
  async run(progress) {
    const doc = await loadSrc(S.doc), pages = doc.getPages();
    for (const [i, page] of pages.entries()) {
      if (S.skip && i === 0) continue;
      const ti = await textImage(this.label(i), { size: S.size, color: '#222222' });
      const { width: W, height: H } = page.getSize();
      const p = this.place(W, H, ti.w, ti.h);
      page.drawImage(await doc.embedPng(ti.url), { x: p.x, y: p.y, width: ti.w, height: ti.h });
      progress((i + 1) / pages.length);
    }
    return { blob: pdfBlob(await doc.save()), name: `${baseName(S.doc.name)}-numbered.pdf` };
  },
};

/* ---------- page shell ---------- */
const TOOL = document.body.dataset.tool;
const impl = IMPL[TOOL];
let board, side, lastOut = null;

function buildShell() {
  const multiple = !!impl.multiple, isImg = impl.accept === 'image';
  document.body.insertAdjacentHTML('afterbegin', `
  <header class="top gutter">
    <a class="brand" href="index.html" aria-label="Inkpad PDF">${BRAND}<b>Inkpad <i>PDF</i></b></a>
    <div class="spacer"></div>
    <details class="menu"><summary class="btn ghost">${ICON.grid}<span class="lbl" data-i="allTools"></span></summary><nav class="menu-list" id="menuList"></nav></details>
    <div class="lang" role="group" aria-label="Language"><button type="button" data-lang="th">TH</button><button type="button" data-lang="en">EN</button></div>
  </header>
  <main>
    <section class="hero gutter"><div class="tool-ic">${ICON[TOOL]}</div><h1 data-i="${TOOL}_t"></h1><p data-i="${TOOL}_lead"></p></section>
    <div class="stage gutter">
      <label class="dropzone" id="drop" for="fileIn">
        ${ICON.doc.replace('<svg', '<svg class="doc-ic"')}
        <b data-i="${isImg ? 'dropImg' : multiple ? 'dropPdfs' : 'dropPdf'}"></b>
        <p data-i="orPick"></p>
        <span class="btn primary lg"><span data-i="${isImg ? 'pickImg' : 'pickPdf'}"></span></span>
        <span class="privacy">${ICON.lock}<span data-i="privacy"></span></span>
      </label>
      <input type="file" id="fileIn" class="sr" ${multiple ? 'multiple' : ''} accept="${isImg ? 'image/*,.heic,.heif' : 'application/pdf,.pdf'}">
      <div class="work" id="work" hidden><div class="board" id="board"></div><aside class="side" id="side"></aside></div>
      <div class="result" id="result" hidden>
        <div class="okic">${ICON.ok}</div><h2 data-i="doneT"></h2><p id="doneMsg"></p>
        <div class="row"><button class="btn primary lg" id="againBtn" type="button">${ICON.download}<span data-i="downloadAgain"></span></button>
        <button class="btn lg" id="newBtn" type="button"><span data-i="startOver"></span></button></div>
      </div>
    </div>
    <section class="section gutter"><h2 data-i="moreTools"></h2><div class="tools-grid" id="toolsGrid"></div></section>
    <section class="section gutter howto">
      <div><h2 data-i="howTo"></h2><ol id="steps"></ol></div>
      <div><h2 data-i="faq"></h2><div class="faq" id="faqList"></div></div>
    </section>
  </main>
  <footer class="gutter" data-i="footer"></footer>
  <div class="toast" id="toast" hidden></div>`);
  board = $('#board'); side = $('#side');

  const fileIn = $('#fileIn'), drop = $('#drop');
  fileIn.onchange = () => { handleFiles([...fileIn.files]); fileIn.value = ''; };
  ['dragover', 'dragenter'].forEach(ev => document.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(ev => document.addEventListener(ev, e => { if (ev === 'drop' || !e.relatedTarget) drop.classList.remove('over'); }));
  document.addEventListener('drop', e => { e.preventDefault(); if (e.dataTransfer.files.length) handleFiles([...e.dataTransfer.files]); });
  document.querySelectorAll('.lang button').forEach(b => b.onclick = () => {
    lang = b.dataset.lang; try { localStorage.setItem('inkpad.lang', lang); } catch (e) {}
    applyLang(); if (!$('#work').hidden) rerender();
  });
  $('#againBtn').onclick = () => lastOut && downloadBlob(lastOut.blob, lastOut.name);
  $('#newBtn').onclick = () => { impl.init(); lastOut = null; show('drop'); };
  document.addEventListener('click', e => { const m = $('.menu'); if (m.open && !m.contains(e.target)) m.open = false; });
}

function applyLang() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i]').forEach(el => el.innerHTML = t(el.dataset.i));
  document.querySelectorAll('.lang button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  const link = tool => `<a href="${tool.href}" ${tool.id === TOOL ? 'aria-current="page"' : ''}><span class="ic">${ICON[tool.id]}</span><span>${esc(t(tool.id + '_t'))}</span></a>`;
  $('#menuList').innerHTML = TOOLS.map(link).join('');
  $('#toolsGrid').innerHTML = TOOLS.filter(x => x.id !== TOOL).map(x =>
    `<a class="tool-card" href="${x.href}"><span class="ic">${ICON[x.id]}</span><b>${esc(t(x.id + '_t'))}</b><span>${esc(t(x.id + '_d'))}</span></a>`).join('');
  $('#steps').innerHTML = t(TOOL + '_steps').map(s => `<li>${s}</li>`).join('');
  $('#faqList').innerHTML = [1, 2, 3].map(i => `<details><summary>${t('q' + i)}</summary><p>${t('a' + i)}</p></details>`).join('');
  if (lastOut) $('#doneMsg').textContent = t('doneD', { f: lastOut.name });
}

function show(which) {
  $('#drop').hidden = which !== 'drop';
  $('#work').hidden = which !== 'work';
  $('#result').hidden = which !== 'result';
}

let pickAdd = false;
function pickFiles(add) { pickAdd = add; $('#fileIn').click(); }

async function handleFiles(files) {
  const want = impl.accept === 'image' ? f => f.type.startsWith('image/') || isHeic(f) : f => f.type === 'application/pdf' || /\.pdf$/i.test(f.name);
  const ok = files.filter(want);
  if (!ok.length) { toast(t(impl.accept === 'image' ? 'errImg' : 'errPdf')); return; }
  const adding = pickAdd && !$('#work').hidden; pickAdd = false;
  if (!adding) { impl.init(); lastOut = null; }
  if (!$('#result').hidden) show('drop');
  const label = $('#drop b'); const old = label.innerHTML; label.textContent = t('loading');
  try { await impl.add(impl.multiple ? ok : ok.slice(0, 1)); }
  finally { label.innerHTML = old; }
  if (!impl.ready()) return;
  show('work');
  rerender();
  if (!adding) $('#work').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function rerender() {
  await impl.render();
  const btn = $('#runBtn'); if (btn) btn.onclick = run;
}

async function run() {
  const btn = $('#runBtn'), label = btn.querySelector('span'), bar = $('.progress', side);
  const old = label.textContent;
  btn.disabled = true; label.textContent = t('working'); bar.hidden = false;
  const progress = (f, text) => { bar.firstElementChild.style.width = Math.round(f * 100) + '%'; if (text) label.textContent = text; };
  try {
    lastOut = await impl.run(progress);
    downloadBlob(lastOut.blob, lastOut.name);
    $('#doneMsg').textContent = t('doneD', { f: lastOut.name });
    show('result');
    $('#result').scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (e) {
    console.error(e);
    toast(e.userMsg || t('errRun'), 4500);
  } finally {
    btn.disabled = false; label.textContent = old; bar.hidden = true;
  }
}

buildShell();
impl.init();
applyLang();
// Expose state for debugging in the browser console.
window.inkpadTools = { S, IMPL, handleFiles };
})();
