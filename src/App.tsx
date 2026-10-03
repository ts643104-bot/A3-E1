import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Capacitor, type PluginListenerHandle } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import {
  ArrowLeft,
  ArrowUpRight,
  AudioLines,
  BarChart3,
  Bell,
  BookOpen,
  CalendarPlus,
  Check,
  ChevronLeft,
  CircleHelp,
  Clock3,
  Database,
  Download,
  Flame,
  Headphones,
  Home,
  LockKeyhole,
  LogOut,
  Menu,
  Mic,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Square,
  Target,
  Trophy,
  Volume2,
  X,
} from 'lucide-react'
import './App.css'

type Section = 'today' | 'path' | 'progress'
type LocalTrainee = { name: string; email: string; salt: string; verifier: string }
type LessonSchedule = { id: string; notificationId?: number; lessonId: string; weekday: number; time: string; duration: number }

const TERMS_VERSION = '2026-10-v2'
const weekdayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

function bytesToBase64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes))
}

async function passwordVerifier(password: string, salt: Uint8Array) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const result = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: salt.buffer as ArrayBuffer, iterations: 120_000, hash: 'SHA-256' }, key, 256)
  return bytesToBase64(new Uint8Array(result))
}

function storedValue<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) as T : fallback
  } catch {
    return fallback
  }
}

function TermsScreen({ onAccept }: { onAccept: () => void }) {
  const [readToEnd, setReadToEnd] = useState(false)
  const [agreed, setAgreed] = useState(false)

  function trackReading(event: React.UIEvent<HTMLDivElement>) {
    const panel = event.currentTarget
    if (panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 12) setReadToEnd(true)
  }

  return (
    <main className="access-screen" dir="rtl">
      <section className="access-card terms-card">
        <div className="access-brand"><span className="brand-mark"><AudioLines size={22} /></span><strong>A3&amp;E1</strong><small>اتفاقية الاستخدام</small></div>
        <div className="terms-heading"><span className="section-kicker">اقرأ قبل إنشاء الحساب</span><h1>الشروط والأحكام والخصوصية</h1><p>آخر تحديث: أكتوبر 2026 · الإصدار {TERMS_VERSION}</p></div>
        <div className="terms-scroll" tabIndex={0} role="region" aria-label="نص الشروط والأحكام" onScroll={trackReading}>
          <section><h2>1. طبيعة الخدمة</h2><p>A3&amp;E1 نموذج تعليمي لممارسة الإنجليزية من خلال موضوعات نظم المعلومات الإدارية. المحتوى والتقييم الآلي في هذه النسخة تجريبيان ولا يغنيان عن المحاضرات أو التقييم الأكاديمي الرسمي.</p></section>
          <section><h2>2. الحساب والبيانات</h2><p>هذه النسخة تحفظ اسم المتدرّب وبريده ومواعيده وتقدّمه على هذا الجهاز فقط. لا يوجد خادم حسابات أو مزامنة سحابية حالياً. كلمة المرور لا تُحفظ كنص؛ يحفظ المتصفح مشتقاً تشفيرياً محلياً، لكن هذا لا يجعل الحساب بديلاً عن خدمة مصادقة خادمية.</p></section>
          <section><h2>3. التسجيل الصوتي</h2><p>لا يبدأ التسجيل إلا بعد ضغطك على زر الميكروفون ومنح الإذن. يسجل المتصفح الصوت محلياً لمعاينته أو تنزيله، ولا يرفعه التطبيق إلى خادم في هذه النسخة. لا يتضمن النموذج تحليلاً دقيقاً لمخارج الحروف أو النبر. إذا استخدمت خاصية من المتصفح لمعالجة الصوت، فقد تنطبق سياسة ذلك المتصفح.</p></section>
          <section><h2>4. المواعيد والتنبيهات</h2><p>يمكنك إضافة مواعيد أسبوعية ومدة لكل درس. نسخة Android ترسل إشعاراً محلياً عند منح الإذن، وقد يتأخر حسب إعدادات البطارية والمنبهات الدقيقة. نسخة الويب تذكّر أثناء فتح الصفحة فقط. لا يفتح التطبيق نفسه بالقوة ولا يمنع إغلاقه أو استخدام تطبيق آخر.</p></section>
          <section><h2>5. الاستخدام المسؤول</h2><p>استخدم التطبيق للتعلّم الشخصي، ولا ترفع تسجيلات أشخاص آخرين دون إذنهم. أنت مسؤول عن مراجعة صحة أي مادة تعليمية قبل استخدامها في واجب أو قرار أكاديمي.</p></section>
          <section><h2>6. التحكم والحذف</h2><p>يمكنك تسجيل الخروج. لحذف الحساب والمواعيد والتقدم نهائياً، امسح بيانات الموقع من إعدادات المتصفح على هذا الجهاز. استخدام جهاز آخر لا ينقل بياناتك، ولا توجد استعادة للحساب في النسخة المحلية.</p></section>
          <section><h2>7. حدود النسخة التجريبية</h2><p>قد تتغير الميزات أو تتوقف، وقد تكون بعض النتائج تقريبية. لا نقدم ضماناً بتحقيق مستوى لغوي أو نتيجة دراسية محددة. هذه الشروط نموذج توضيحي وليست مراجعة قانونية نهائية.</p></section>
        </div>
        <div className="terms-consent">
          <p className={readToEnd ? 'read-status is-read' : 'read-status'}>{readToEnd ? 'وصلت إلى نهاية الشروط.' : 'مرّر النص حتى النهاية لفتح الموافقة.'}</p>
          <label className={!readToEnd ? 'consent-disabled' : ''}><input type="checkbox" disabled={!readToEnd} checked={agreed} onChange={(event) => setAgreed(event.target.checked)} /> قرأت الشروط وفهمت طريقة حفظ بياناتي وحدود التذكيرات.</label>
          <button className="primary-button access-submit" disabled={!readToEnd || !agreed} onClick={onAccept}>موافقة ومتابعة <ArrowLeft size={16} /></button>
        </div>
      </section>
    </main>
  )
}

function TraineeAccess({
  profileExists,
  onCreate,
  onLogin,
}: {
  profileExists: boolean
  onCreate: (name: string, email: string, password: string) => Promise<string | null>
  onLogin: (email: string, password: string) => Promise<string | null>
}) {
  const [mode, setMode] = useState<'register' | 'login'>(profileExists ? 'login' : 'register')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const message = mode === 'register'
        ? await onCreate(name.trim(), email.trim().toLowerCase(), password)
        : await onLogin(email.trim().toLowerCase(), password)
      if (message) setError(message)
    } catch {
      setError('تعذّر إتمام العملية. تأكد من دعم المتصفح للتشفير ثم أعد المحاولة.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="access-screen" dir="rtl">
      <section className="access-card login-card">
        <div className="access-brand"><span className="brand-mark"><AudioLines size={22} /></span><strong>A3&amp;E1</strong><small>بوابة المتدرّب</small></div>
        <div className="login-heading"><span className="section-kicker">مساحة تعلّمك تبدأ من هنا</span><h1>{mode === 'register' ? 'إنشاء حساب متدرّب' : 'تسجيل دخول المتدرّب'}</h1><p>بيانات هذا الحساب تحفظ على هذا الجهاز في النسخة الحالية.</p></div>
        <div className="login-tabs"><button className={mode === 'register' ? 'tab-active' : ''} onClick={() => { setMode('register'); setError('') }}>حساب جديد</button><button className={mode === 'login' ? 'tab-active' : ''} onClick={() => { setMode('login'); setError('') }}>تسجيل الدخول</button></div>
        <form className="access-form" onSubmit={submit}>
          {mode === 'register' && <label>اسم المتدرّب<input required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="الاسم الذي يظهر في التطبيق" /></label>}
          <label>البريد الإلكتروني<input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" dir="ltr" /></label>
          <label>كلمة المرور<input type="password" required minLength={8} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="8 أحرف على الأقل" dir="ltr" /></label>
          {mode === 'register' && <p className="password-note">اختر كلمة مرور من 8 أحرف أو أكثر. لا تُرسل هذه النسخة كلمة المرور إلى الإنترنت.</p>}
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-button access-submit" type="submit" disabled={submitting}>{submitting ? 'جارٍ التحقق...' : mode === 'register' ? 'إنشاء الحساب' : 'دخول إلى مساحة التعلّم'} <ArrowLeft size={16} /></button>
        </form>
        <p className="local-account-note"><ShieldCheck size={15} /> الحساب محلي لهذا المتصفح، وليس حساباً سحابياً.</p>
      </section>
    </main>
  )
}
const lessons = [
  {
    id: 'database', title: 'Database Management', unit: 'الوحدة 03 · المفاتيح الأساسية', progress: 68,
    icon: Database, color: 'mint', duration: '12 دقيقة', category: 'database', categoryLabel: 'قواعد البيانات', level: 'B1',
    task: 'Explain why a relational database needs primary keys.',
    translation: 'اشرح لماذا تحتاج قاعدة البيانات العلائقية إلى مفاتيح أساسية.',
    sentence: 'A primary key uniquely identifies each record in a table.',
    prompt: 'سجّل شرحك في جملتين. اذكر كيف يمنع المفتاح الأساسي تكرار هوية السجل.',
    words: ['primary key', 'record', 'table', 'unique'],
  },
  {
    id: 'systems', title: 'Systems Analysis', unit: 'الوحدة 03 · كتابة متطلب قابل للقياس', progress: 42,
    icon: Target, color: 'peach', duration: '15 دقيقة', category: 'systems', categoryLabel: 'تحليل النظم', level: 'B1',
    task: 'Turn a user complaint into a measurable system requirement.',
    translation: 'حوّل شكوى المستخدم إلى متطلب نظام قابل للقياس.',
    sentence: 'The system should display search results within two seconds.',
    prompt: 'اكتب متطلباً وظيفياً واضحاً لنظام مخزون، واجعله قابلاً للاختبار.',
    words: ['system', 'display', 'results', 'seconds', 'requirement'], intensive: false,
  },
  {
    id: 'projects', title: 'IT Project Management', unit: 'الوحدة 03 · تحديث حالة المشروع', progress: 25,
    icon: BarChart3, color: 'lavender', duration: '10 دقائق', category: 'projects', categoryLabel: 'إدارة المشاريع', level: 'B1',
    task: 'Give a concise status update about a delayed software project.',
    translation: 'قدّم تحديثاً مختصراً عن مشروع برمجي متأخر.',
    sentence: 'The testing phase is delayed because two critical bugs remain.',
    prompt: 'اشرح سبب التأخير، أثره، والخطوة التالية في تحديث صوتي قصير.',
    words: ['delayed', 'because', 'impact', 'next step', 'testing'],
  },
  {
    id: 'commerce', title: 'E-Commerce', unit: 'الوحدة 03 · تحسين الدفع', progress: 16,
    icon: Sparkles, color: 'yellow', duration: '14 دقيقة', category: 'commerce', categoryLabel: 'التجارة الإلكترونية', level: 'B1',
    task: 'Describe how a checkout flow reduces abandoned carts.',
    translation: 'اشرح كيف تقلل خطوات الدفع من السلات المتروكة.',
    sentence: 'A simpler checkout process can reduce cart abandonment.',
    prompt: 'اقترح تحسيناً واحداً لصفحة الدفع واشرح أثره على العميل.',
    words: ['checkout', 'process', 'customer', 'reduce', 'cart'],
  },
  {
    id: 'database-intro', title: 'Database Management', unit: 'الوحدة 01 · الجداول والحقول', progress: 100,
    icon: Database, color: 'mint', duration: '8 دقائق', category: 'database', categoryLabel: 'قواعد البيانات', level: 'A1',
    task: 'Describe what a table stores in a student database.',
    translation: 'صف ما الذي يخزّنه الجدول في قاعدة بيانات الطلاب.',
    sentence: 'A table stores information about students.',
    prompt: 'عرّف الجدول والصف والحقل باستخدام مثال بيانات طالب واحد.',
    words: ['table', 'row', 'field', 'student'],
  },
  {
    id: 'database-relations', title: 'Database Management', unit: 'الوحدة 02 · ربط البيانات', progress: 82,
    icon: Database, color: 'mint', duration: '10 دقائق', category: 'database', categoryLabel: 'قواعد البيانات', level: 'A2',
    task: 'Explain how students and courses can be connected.',
    translation: 'اشرح كيف يمكن ربط الطلاب بالمقررات.',
    sentence: 'The enrollment table connects students to courses.',
    prompt: 'اشرح علاقة الطالب بالمقرر ولماذا نحتاج جدول تسجيل وسيط.',
    words: ['connect', 'enrollment', 'student', 'course'],
  },
  {
    id: 'database-indexing', title: 'Database Management', unit: 'الوحدة 04 · الفهارس والأداء', progress: 0,
    icon: Database, color: 'mint', duration: '18 دقيقة', category: 'database', categoryLabel: 'قواعد البيانات', level: 'B2',
    task: 'Compare an indexed query with a full table scan.',
    translation: 'قارن بين استعلام يستخدم فهرساً وآخر يفحص الجدول كاملاً.',
    sentence: 'An index can speed up reads but adds storage and write costs.',
    prompt: 'برّر متى تضيف فهرساً إلى جدول كبير، واذكر أثراً جانبياً واحداً.',
    words: ['index', 'query', 'storage', 'read', 'write'],
  },
  {
    id: 'database-capstone', title: 'Database Management', unit: 'مشروع مكثّف · تصميم قاعدة بيانات', progress: 0,
    icon: Database, color: 'mint', duration: '25 دقيقة', category: 'database', categoryLabel: 'قواعد البيانات', level: 'C1', intensive: true,
    task: 'Present a secure database design for a university registration system.',
    translation: 'اعرض تصميماً آمناً لقاعدة بيانات نظام تسجيل جامعي.',
    sentence: 'The schema separates personal data from course enrollment records.',
    prompt: 'صمّم الجداول والعلاقات، ثم قدّم مبررات التطبيع وحماية بيانات الطالب.',
    words: ['schema', 'normalize', 'relationship', 'privacy', 'constraint'],
  },
  {
    id: 'systems-workflows', title: 'Systems Analysis', unit: 'الوحدة 01 · المستخدم وسير العمل', progress: 100,
    icon: Target, color: 'peach', duration: '8 دقائق', category: 'systems', categoryLabel: 'تحليل النظم', level: 'A1',
    task: 'Identify the user and one action in an inventory system.',
    translation: 'حدّد مستخدماً وإجراءً واحداً في نظام مخزون.',
    sentence: 'A store clerk updates the quantity of an item.',
    prompt: 'صف من يستخدم النظام وما الإجراء الذي يريد تنفيذه.',
    words: ['user', 'item', 'quantity', 'update'],
  },
  {
    id: 'systems-requirements', title: 'Systems Analysis', unit: 'الوحدة 02 · المتطلبات الوظيفية', progress: 74,
    icon: Target, color: 'peach', duration: '12 دقيقة', category: 'systems', categoryLabel: 'تحليل النظم', level: 'A2',
    task: 'Write one functional requirement for an inventory search.',
    translation: 'اكتب متطلباً وظيفياً للبحث في المخزون.',
    sentence: 'The user can search items by product name.',
    prompt: 'حوّل طلب المستخدم إلى جملة تبدأ بـ The system shall أو The user can.',
    words: ['user', 'search', 'item', 'product'],
  },
  {
    id: 'systems-usecases', title: 'Systems Analysis', unit: 'الوحدة 04 · حالات الاستخدام والقبول', progress: 0,
    icon: Target, color: 'peach', duration: '18 دقيقة', category: 'systems', categoryLabel: 'تحليل النظم', level: 'B2',
    task: 'Turn a return request into acceptance criteria.',
    translation: 'حوّل طلب إرجاع منتج إلى معايير قبول.',
    sentence: 'The request is accepted when the order is within the return period.',
    prompt: 'حدّد الممثل والخطوات الأساسية وثلاثة شروط لقبول طلب الإرجاع.',
    words: ['actor', 'acceptance', 'criteria', 'request', 'condition'],
  },
  {
    id: 'systems-capstone', title: 'Systems Analysis', unit: 'مشروع مكثّف · تحليل نظام مخزون', progress: 0,
    icon: Target, color: 'peach', duration: '25 دقيقة', category: 'systems', categoryLabel: 'تحليل النظم', level: 'C1', intensive: true,
    task: 'Present a complete requirements brief for a multi-branch inventory system.',
    translation: 'اعرض موجز متطلبات متكاملاً لنظام مخزون متعدد الفروع.',
    sentence: 'The solution must reconcile stock changes across all branches.',
    prompt: 'قدّم أصحاب المصلحة والنطاق والمتطلبات ومخاطر التكامل ومعايير القبول.',
    words: ['stakeholder', 'scope', 'reconcile', 'constraint', 'acceptance'],
  },
  {
    id: 'projects-foundations', title: 'IT Project Management', unit: 'الوحدة 01 · الأدوار والمهام', progress: 100,
    icon: BarChart3, color: 'lavender', duration: '8 دقائق', category: 'projects', categoryLabel: 'إدارة المشاريع', level: 'A1',
    task: 'Name two roles on a small software project.',
    translation: 'اذكر دورين في مشروع برمجي صغير.',
    sentence: 'The analyst gathers requirements and the developer writes code.',
    prompt: 'قدّم عضوين في فريق مشروع واشرح مسؤولية كل واحد بجملة.',
    words: ['analyst', 'developer', 'team', 'task'],
  },
  {
    id: 'projects-timeline', title: 'IT Project Management', unit: 'الوحدة 02 · الجدول والمعالم', progress: 70,
    icon: BarChart3, color: 'lavender', duration: '12 دقيقة', category: 'projects', categoryLabel: 'إدارة المشاريع', level: 'A2',
    task: 'Explain the difference between a task and a milestone.',
    translation: 'اشرح الفرق بين المهمة والمعلم الرئيسي.',
    sentence: 'Completing the prototype is a milestone in the project plan.',
    prompt: 'رتّب ثلاث مهام بسيطة وحدّد المعلم الذي يثبت اكتمال المرحلة.',
    words: ['task', 'milestone', 'schedule', 'complete'],
  },
  {
    id: 'projects-risk', title: 'IT Project Management', unit: 'الوحدة 04 · المخاطر وأصحاب المصلحة', progress: 0,
    icon: BarChart3, color: 'lavender', duration: '18 دقيقة', category: 'projects', categoryLabel: 'إدارة المشاريع', level: 'B2',
    task: 'Explain a delivery risk and propose a mitigation plan.',
    translation: 'اشرح خطراً يهدد التسليم واقترح خطة لتخفيفه.',
    sentence: 'We can reduce integration risk by testing the API early.',
    prompt: 'قيّم احتمال الخطر وأثره، ثم اقترح إجراءً ومسؤولاً عنه.',
    words: ['risk', 'impact', 'mitigate', 'integration', 'owner'],
  },
  {
    id: 'projects-capstone', title: 'IT Project Management', unit: 'مشروع مكثّف · خطة إطلاق منتج', progress: 0,
    icon: BarChart3, color: 'lavender', duration: '25 دقيقة', category: 'projects', categoryLabel: 'إدارة المشاريع', level: 'C1', intensive: true,
    task: 'Lead a project review for a delayed product launch.',
    translation: 'أدر مراجعة مشروع لإطلاق منتج متأخر.',
    sentence: 'The revised release plan protects quality while reducing scope.',
    prompt: 'اعرض الحالة والانحراف والمخاطر والخيارات والقرار المطلوب من أصحاب المصلحة.',
    words: ['variance', 'scope', 'stakeholder', 'trade-off', 'release'],
  },
  {
    id: 'commerce-catalog', title: 'E-Commerce', unit: 'الوحدة 01 · المنتجات والأسعار', progress: 100,
    icon: Sparkles, color: 'yellow', duration: '8 دقائق', category: 'commerce', categoryLabel: 'التجارة الإلكترونية', level: 'A1',
    task: 'Describe a product listing in an online store.',
    translation: 'صف بطاقة منتج في متجر إلكتروني.',
    sentence: 'The listing shows the product name, price, and stock status.',
    prompt: 'اذكر ثلاث معلومات يحتاجها العميل قبل إضافة المنتج إلى السلة.',
    words: ['product', 'price', 'stock', 'customer'],
  },
  {
    id: 'commerce-cart', title: 'E-Commerce', unit: 'الوحدة 02 · السلة وخطوات الدفع', progress: 65,
    icon: Sparkles, color: 'yellow', duration: '12 دقيقة', category: 'commerce', categoryLabel: 'التجارة الإلكترونية', level: 'A2',
    task: 'Explain the steps a customer follows to place an order.',
    translation: 'اشرح الخطوات التي يتبعها العميل لإتمام الطلب.',
    sentence: 'The customer reviews the cart before confirming payment.',
    prompt: 'رتّب رحلة العميل من السلة حتى تأكيد الطلب مستخدماً first, next, finally.',
    words: ['cart', 'review', 'payment', 'confirm'],
  },
  {
    id: 'commerce-funnel', title: 'E-Commerce', unit: 'الوحدة 04 · التحويل ومؤشرات الأداء', progress: 0,
    icon: Sparkles, color: 'yellow', duration: '18 دقيقة', category: 'commerce', categoryLabel: 'التجارة الإلكترونية', level: 'B2',
    task: 'Interpret a drop in conversion between product views and checkout.',
    translation: 'فسّر انخفاض التحويل بين مشاهدة المنتج وبدء الدفع.',
    sentence: 'A high drop-off at checkout may indicate friction or unexpected costs.',
    prompt: 'اقرأ مؤشرين من مسار التحويل واقترح تجربة A/B لاختبار سبب الانخفاض.',
    words: ['conversion', 'drop-off', 'checkout', 'metric', 'experiment'],
  },
  {
    id: 'commerce-capstone', title: 'E-Commerce', unit: 'مشروع مكثّف · تحليل متجر رقمي', progress: 0,
    icon: Sparkles, color: 'yellow', duration: '25 دقيقة', category: 'commerce', categoryLabel: 'التجارة الإلكترونية', level: 'C1', intensive: true,
    task: 'Present an evidence-based plan to improve an online store funnel.',
    translation: 'اعرض خطة مبنية على البيانات لتحسين مسار متجر إلكتروني.',
    sentence: 'We should test the checkout redesign against a privacy-safe baseline.',
    prompt: 'حلل بيانات الزيارة والشراء، صغ فرضية، ثم اقترح تجربة ومقياس نجاح ومخاطر الخصوصية.',
    words: ['funnel', 'hypothesis', 'baseline', 'conversion', 'privacy'],
  },
]

const categories = [
  { id: 'all', label: 'كل التخصصات' },
  { id: 'database', label: 'قواعد البيانات' },
  { id: 'systems', label: 'تحليل النظم' },
  { id: 'projects', label: 'إدارة المشاريع' },
  { id: 'commerce', label: 'التجارة الإلكترونية' },
]

const proficiencyLevels = ['all', 'A1', 'A2', 'B1', 'B2', 'C1']
const featuredLessons = lessons.slice(0, 4)

const navItems: { id: Section; label: string; icon: typeof Home }[] = [
  { id: 'today', label: 'الرئيسية', icon: Home },
  { id: 'path', label: 'مسارات التعلّم', icon: BookOpen },
  { id: 'progress', label: 'تقدّمي', icon: BarChart3 },
]

const dailyChallenge = {
  ...lessons[0],
  id: 'daily-sql',
  unit: 'تحدّي اليوم · قواعد البيانات',
  duration: '1 دقيقة',
  task: 'Explain how SQL retrieves data from a database.',
  translation: 'اشرح كيف تستخدم SQL لاسترجاع بيانات من قاعدة البيانات.',
  sentence: 'SELECT name FROM students WHERE active = true.',
  prompt: 'اشرح خلال دقيقة كيف تستخدم SQL لاسترجاع سجلات محددة من جدول قاعدة البيانات.',
  words: ['select', 'from', 'where', 'retrieve', 'query'],
}

function App() {
  const [profile, setProfile] = useState<LocalTrainee | null>(() => storedValue<LocalTrainee | null>('a3e1-trainee', null))
  const [termsAccepted, setTermsAccepted] = useState(() => localStorage.getItem('a3e1-terms-version') === TERMS_VERSION)
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(sessionStorage.getItem('a3e1-session')))
  const [schedules, setSchedules] = useState<LessonSchedule[]>(() => storedValue<LessonSchedule[]>('a3e1-schedules', []))
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [scheduleLessonId, setScheduleLessonId] = useState(lessons[0].id)
  const [scheduleWeekday, setScheduleWeekday] = useState(1)
  const [scheduleTime, setScheduleTime] = useState('18:00')
  const [scheduleDuration, setScheduleDuration] = useState(30)
  const [dueSchedule, setDueSchedule] = useState<LessonSchedule | null>(null)
  const [notificationPermission, setNotificationPermission] = useState(() => Capacitor.isNativePlatform() ? 'prompt' : 'Notification' in window ? Notification.permission : 'unsupported')
  const [section, setSection] = useState<Section>('today')
  const [selectedLesson, setSelectedLesson] = useState(lessons[0])
  const [sessionLesson, setSessionLesson] = useState(lessons[0])
  const [inputMode, setInputMode] = useState<'speak' | 'write'>('speak')
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [audioUrl, setAudioUrl] = useState('')
  const [audioFileName, setAudioFileName] = useState('A3E1-MIS-response.webm')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [selectedFormat, setSelectedFormat] = useState<'all' | 'intensive'>('all')
  const [focusSession, setFocusSession] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(12 * 60)
  const [sessionDurationMinutes, setSessionDurationMinutes] = useState(12)
  const [completed, setCompleted] = useState(() => localStorage.getItem('a3e1-completed') === 'true')
  const [xp, setXp] = useState(() => Number(localStorage.getItem('a3e1-xp') ?? 420))
  const [showTip, setShowTip] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const triggeredSchedulesRef = useRef(new Set<string>())
  const schedulesRef = useRef(schedules)
  const notificationListenerRef = useRef<PluginListenerHandle | null>(null)

  useEffect(() => {
    if (!focusSession || secondsLeft <= 0) return
    const timer = window.setInterval(() => setSecondsLeft((seconds) => seconds - 1), 1000)
    return () => window.clearInterval(timer)
  }, [focusSession, secondsLeft])

  useEffect(() => {
    if (!isRecording) return
    const timer = window.setInterval(() => setRecordingSeconds((seconds) => seconds + 1), 1000)
    return () => window.clearInterval(timer)
  }, [isRecording])

  useEffect(() => {
    if (!audioUrl) return
    return () => URL.revokeObjectURL(audioUrl)
  }, [audioUrl])

  useEffect(() => () => {
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop()
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop())
  }, [])

  useEffect(() => {
    schedulesRef.current = schedules
  }, [schedules])

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return
    let disposed = false
    void LocalNotifications.createChannel({ id: 'lesson-reminders', name: 'مواعيد الدروس', description: 'تذكيرات مواعيد دروس A3&E1', importance: 4, vibration: true }).catch(() => undefined)
    void LocalNotifications.checkPermissions().then((permission) => setNotificationPermission(permission.display)).catch(() => setNotificationPermission('unsupported'))
    void LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
      const scheduleId = action.notification.extra?.scheduleId
      const schedule = schedulesRef.current.find((item) => item.id === scheduleId)
      if (schedule) setDueSchedule(schedule)
    }).then((listener) => {
      if (disposed) void listener.remove()
      else notificationListenerRef.current = listener
    })
    return () => {
      disposed = true
      void notificationListenerRef.current?.remove()
      notificationListenerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (Capacitor.isNativePlatform()) return
    const checkSchedules = () => {
      const now = new Date()
      const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`
      const minuteNow = now.getHours() * 60 + now.getMinutes()
      const schedule = schedules.find((item) => {
        const [hour, minute] = item.time.split(':').map(Number)
        const dueMinute = hour * 60 + minute
        const key = `${todayKey}-${item.id}`
        return item.weekday === now.getDay() && minuteNow >= dueMinute && minuteNow - dueMinute < 2 && !triggeredSchedulesRef.current.has(key)
      })
      if (!schedule) return
      triggeredSchedulesRef.current.add(`${todayKey}-${schedule.id}`)
      setDueSchedule(schedule)
      if ('Notification' in window && Notification.permission === 'granted') {
        const lesson = lessons.find((item) => item.id === schedule.lessonId)
        try {
          new Notification('موعد درس A3&E1', { body: `حان موعد ${lesson?.title ?? 'درسك'}. افتح التطبيق لبدء الجلسة.` })
        } catch {
          setNotificationPermission('unsupported')
        }
      }
    }
    const timer = window.setInterval(checkSchedules, 15_000)
    return () => window.clearInterval(timer)
  }, [schedules])

  const formattedTime = `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`

  async function registerTrainee(name: string, email: string, password: string) {
    if (profile) return 'يوجد حساب محلي بالفعل. استخدم تبويب تسجيل الدخول.'
    if (password.length < 8) return 'كلمة المرور يجب أن تتكون من 8 أحرف على الأقل.'
    const salt = crypto.getRandomValues(new Uint8Array(16))
    const trainee: LocalTrainee = { name, email, salt: bytesToBase64(salt), verifier: await passwordVerifier(password, salt) }
    localStorage.setItem('a3e1-trainee', JSON.stringify(trainee))
    setProfile(trainee)
    sessionStorage.setItem('a3e1-session', email)
    setIsAuthenticated(true)
    return null
  }

  async function loginTrainee(email: string, password: string) {
    if (!profile || profile.email !== email) return 'لا يوجد حساب بهذا البريد على هذا الجهاز. أنشئ حساباً محلياً أولاً.'
    const salt = Uint8Array.from(atob(profile.salt), (character) => character.charCodeAt(0))
    const verifier = await passwordVerifier(password, salt)
    if (verifier !== profile.verifier) return 'البريد أو كلمة المرور غير صحيحة.'
    sessionStorage.setItem('a3e1-session', email)
    setIsAuthenticated(true)
    return null
  }

  function acceptTerms() {
    localStorage.setItem('a3e1-terms-version', TERMS_VERSION)
    localStorage.setItem('a3e1-terms-accepted-at', new Date().toISOString())
    setTermsAccepted(true)
  }

  function saveSchedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const schedule: LessonSchedule = {
      id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`, lessonId: scheduleLessonId, weekday: scheduleWeekday,
      notificationId: Math.floor(Math.random() * 2_000_000_000), time: scheduleTime, duration: scheduleDuration,
    }
    setSchedules((current) => {
      const updated = [...current, schedule].sort((first, second) => first.weekday - second.weekday || first.time.localeCompare(second.time))
      localStorage.setItem('a3e1-schedules', JSON.stringify(updated))
      return updated
    })
    void scheduleNativeReminder(schedule)
    setShowScheduleForm(false)
  }

  function removeSchedule(scheduleId: string) {
    const scheduleToRemove = schedules.find((schedule) => schedule.id === scheduleId)
    if (Capacitor.isNativePlatform() && scheduleToRemove?.notificationId) {
      void LocalNotifications.cancel({ notifications: [{ id: scheduleToRemove.notificationId }] }).catch(() => undefined)
    }
    setSchedules((current) => {
      const updated = current.filter((schedule) => schedule.id !== scheduleId)
      localStorage.setItem('a3e1-schedules', JSON.stringify(updated))
      return updated
    })
  }

  function startScheduledLesson(schedule: LessonSchedule) {
    const lesson = lessons.find((item) => item.id === schedule.lessonId) ?? dailyChallenge
    setDueSchedule(null)
    startFocusSession(lesson, schedule.duration)
  }

  function snoozeSchedule(schedule: LessonSchedule) {
    setDueSchedule(null)
    window.setTimeout(() => setDueSchedule(schedule), 10 * 60 * 1000)
  }

  async function enableNotifications() {
    if (Capacitor.isNativePlatform()) {
      try {
        const permission = await LocalNotifications.requestPermissions()
        setNotificationPermission(permission.display)
        if (permission.display === 'granted') await Promise.all(schedules.map(scheduleNativeReminder))
      } catch {
        setNotificationPermission('unsupported')
      }
      return
    }
    if (!('Notification' in window) || !window.isSecureContext) {
      setNotificationPermission('unsupported')
      return
    }
    try {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
    } catch {
      setNotificationPermission('unsupported')
    }
  }

  async function scheduleNativeReminder(schedule: LessonSchedule) {
    if (!Capacitor.isNativePlatform()) return
    try {
      const permission = await LocalNotifications.checkPermissions()
      if (permission.display !== 'granted') {
        const requested = await LocalNotifications.requestPermissions()
        setNotificationPermission(requested.display)
        if (requested.display !== 'granted') return
      }
      const [hour, minute] = schedule.time.split(':').map(Number)
      const lesson = lessons.find((item) => item.id === schedule.lessonId)
      await LocalNotifications.schedule({
        notifications: [{
          id: schedule.notificationId ?? Math.floor(Math.random() * 2_000_000_000),
          title: `A3&E1 · ${lesson?.title ?? 'درس MIS'}`,
          body: `${lesson?.unit ?? 'موعد درسك'} · مدّة ${schedule.duration} دقيقة`,
          schedule: { on: { weekday: schedule.weekday + 1, hour, minute, second: 0 }, allowWhileIdle: true },
          channelId: 'lesson-reminders',
          extra: { scheduleId: schedule.id, lessonId: schedule.lessonId, duration: schedule.duration },
          isExactNotification: false,
        }],
      })
    } catch {
      setNotificationPermission('unsupported')
    }
  }

  function logout() {
    sessionStorage.removeItem('a3e1-session')
    setIsAuthenticated(false)
    stopFocusSession()
  }

  function startFocusSession(lesson = selectedLesson, durationMinutes?: number) {
    setSessionLesson(lesson)
    const sessionMinutes = durationMinutes ?? (Number.parseInt(lesson.duration, 10) || 12)
    setSessionDurationMinutes(sessionMinutes)
    setSecondsLeft(sessionMinutes * 60)
    setFocusSession(true)
    setInputMode('speak')
    setFeedback('')
    setAnswer('')
    setRecordingSeconds(0)
    setAudioUrl('')
    setAudioFileName('A3E1-MIS-response.webm')
  }

  function stopFocusSession() {
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop()
    setIsRecording(false)
    setFocusSession(false)
  }

  function finishLesson() {
    if (completed) return
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop()
    setCompleted(true)
    setXp((currentXp) => {
      const nextXp = currentXp + 40
      localStorage.setItem('a3e1-xp', String(nextXp))
      return nextXp
    })
    localStorage.setItem('a3e1-completed', 'true')
    setFeedback('أحسنت. أُضيفت 40 نقطة خبرة، وحُفظ إنجازك على هذا الجهاز.')
  }

  function reviewAnswer() {
    const lowerAnswer = answer.toLowerCase()
    const matchedWords = sessionLesson.words.filter((word) => lowerAnswer.includes(word))
    if (answer.trim().length < 25) {
      setFeedback('إجابتك قصيرة. أضف سبباً أو مثالاً من السيناريو قبل المراجعة.')
    } else if (matchedWords.length >= 2) {
      setFeedback(`مراجعة تجريبية: استخدمت ${matchedWords.length} مصطلحات مرتبطة بالمهمة. راجع ترتيب الجملة وعلامات الترقيم، ثم أكمل.`)
    } else {
      setFeedback('مراجعة تجريبية: أضف مصطلحين على الأقل من مفردات المهمة لتوضيح فكرتك التقنية.')
    }
  }

  async function toggleRecording() {
    if (isRecording) {
      if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop()
      return
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setFeedback('تسجيل الصوت غير مدعوم هنا. افتح التطبيق عبر HTTPS أو localhost، أو استخدم الكتابة.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      })
      mediaStreamRef.current = stream
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find((type) => MediaRecorder.isTypeSupported(type))
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      mediaRecorderRef.current = recorder
      audioChunksRef.current = []
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data)
      }
      recorder.onerror = () => {
        setIsRecording(false)
        setFeedback('حدثت مشكلة أثناء التسجيل. تحقق من الميكروفون وحاول مرة أخرى.')
      }
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        mediaRecorderRef.current = null
        stream.getTracks().forEach((track) => track.stop())
        mediaStreamRef.current = null
        setIsRecording(false)
        if (audioBlob.size === 0) {
          setFeedback('لم يلتقط التسجيل صوتاً. تحقق من الميكروفون وأعد المحاولة.')
          return
        }
        setAudioFileName(`A3E1-MIS-response.${recorder.mimeType.includes('mp4') ? 'm4a' : 'webm'}`)
        setAudioUrl(URL.createObjectURL(audioBlob))
        setFeedback('تم تسجيل إجابتك. شغّل المقطع لمراجعته قبل الإرسال.')
      }
      recorder.start(250)
      setRecordingSeconds(0)
      setFeedback('التسجيل يعمل. تحدث بوضوح، ثم اضغط إيقاف.')
      setIsRecording(true)
    } catch (error) {
      const message = error instanceof DOMException && error.name === 'NotAllowedError'
        ? 'لم تسمح بالوصول إلى الميكروفون. فعّل الإذن أو استورد تسجيلاً من جهازك.'
        : 'تعذّر بدء التسجيل. تأكد من الإذن والميكروفون؛ التسجيل المباشر على الهاتف يحتاج HTTPS.'
      setFeedback(message)
    }
  }

  function importAudio(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    if (!file) return
    if (!file.type.startsWith('audio/')) {
      setFeedback('اختر ملفاً صوتياً بصيغة مثل M4A أو MP3 أو WebM.')
      event.currentTarget.value = ''
      return
    }
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioFileName(file.name)
    setAudioUrl(URL.createObjectURL(file))
    setRecordingSeconds(0)
    setFeedback('تم تحميل التسجيل من جهازك. يمكنك تشغيله أو تنزيل نسخة منه.')
    event.currentTarget.value = ''
  }

  function deleteRecording() {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl('')
    setRecordingSeconds(0)
    setFeedback('')
  }

  function switchInputMode(mode: 'speak' | 'write') {
    if (isRecording && mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop()
    setInputMode(mode)
  }

  function speakSentence() {
    if (!('speechSynthesis' in window)) {
      setFeedback('تشغيل الصوت غير مدعوم في هذا المتصفح.')
      return
    }
    window.speechSynthesis.cancel()
    const lesson = focusSession ? sessionLesson : selectedLesson
    const utterance = new SpeechSynthesisUtterance(lesson.sentence)
    utterance.lang = 'en-US'
    utterance.rate = 0.88
    window.speechSynthesis.speak(utterance)
  }

  function selectLesson(lesson: (typeof lessons)[number]) {
    setSelectedLesson(lesson)
    setSection('path')
    setAnswer('')
    setFeedback('')
  }

  const filteredLessons = lessons.filter((lesson) => (
    (selectedCategory === 'all' || lesson.category === selectedCategory)
    && (selectedLevel === 'all' || lesson.level === selectedLevel)
    && (selectedFormat === 'all' || lesson.intensive === true)
  ))

  function changeSection(nextSection: Section) {
    setSection(nextSection)
    stopFocusSession()
    setFeedback('')
  }

  const LessonIcon = focusSession ? sessionLesson.icon : selectedLesson.icon
  const pageTitle = section === 'today' ? 'مساحة التعلّم' : section === 'path' ? 'مسارات التخصص' : 'لوحة التقدّم'

  if (!termsAccepted) return <TermsScreen onAccept={acceptTerms} />
  if (!profile || !isAuthenticated) return <TraineeAccess profileExists={Boolean(profile)} onCreate={registerTrainee} onLogin={loginTrainee} />

  return (
    <div className="app-shell" dir="rtl">
      <aside className="sidebar">
        <a className="brand" href="#home" onClick={() => changeSection('today')} aria-label="A3&E1، الرئيسية">
          <span className="brand-mark"><AudioLines size={21} strokeWidth={2.4} /></span>
          <span className="brand-copy"><strong>A3&amp;E1</strong><small>ENGLISH × MIS</small></span>
        </a>
        <div className="sidebar-caption">مساحة الدراسة</div>
        <nav className="side-nav" aria-label="التنقل الرئيسي">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button className={`nav-item ${section === id ? 'is-active' : ''}`} key={id} onClick={() => changeSection(id)}>
              <Icon size={18} strokeWidth={1.9} /><span>{label}</span>{id === 'today' && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-caption track-caption">تخصصي</div>
        <div className="mini-course"><span className="mini-course-icon"><Database size={16} /></span><span><strong>نظم المعلومات</strong><small>المستوى الجامعي</small></span><ChevronLeft size={15} className="mini-arrow" /></div>
        <div className="sidebar-spacer" />
        <div className="sidebar-streak"><div className="streak-top"><span className="streak-flame"><Flame size={16} fill="currentColor" /></span><strong>6 أيام</strong><span className="streak-label">سلسلة التعلّم</span></div><div className="streak-days" aria-label="ستة أيام متتالية"><span className="done">س</span><span className="done">ح</span><span className="done">ن</span><span className="done">ث</span><span className="done">ر</span><span className="today-dot">خ</span><span>ج</span></div></div>
        <button className="profile-row" onClick={logout}><span className="avatar">{profile.name.slice(0, 1)}</span><span className="profile-copy"><strong>{profile.name}</strong><small>تسجيل الخروج</small></span><LogOut size={17} /></button>
      </aside>

      <main className="main-area">
        <header className="topbar"><div className="mobile-brand"><span className="brand-mark"><AudioLines size={19} /></span><strong>A3&amp;E1</strong></div><div className="breadcrumb"><span>مساحة الدراسة</span><ChevronLeft size={14} /><strong>{pageTitle}</strong></div><div className="topbar-actions"><button className="icon-button help-button" aria-label="مساعدة" onClick={() => setShowTip((visible) => !visible)}><CircleHelp size={18} /></button><div className="xp-pill"><span className="xp-spark"><Sparkles size={15} /></span><strong>{xp.toLocaleString('en-US')}</strong><span>XP</span></div><button className="top-avatar" onClick={logout} aria-label="تسجيل الخروج" title="تسجيل الخروج">{profile.name.slice(0, 1)}</button></div></header>
        {showTip && <div className="tip-banner"><ShieldCheck size={18} /><span>جلسات التركيز اختيارية وقابلة للإيقاف. لا يقفل هذا النموذج تطبيقات الهاتف الأخرى.</span><button onClick={() => setShowTip(false)} aria-label="إغلاق"><X size={16} /></button></div>}
        {dueSchedule && <div className="schedule-alert" role="alertdialog" aria-modal="true" aria-labelledby="schedule-alert-title"><div className="schedule-alert-card"><span className="due-icon"><Bell size={21} /></span><span className="section-kicker">موعدك الآن · {dueSchedule.time}</span><h2 id="schedule-alert-title">حان وقت {lessons.find((item) => item.id === dueSchedule.lessonId)?.unit ?? 'درس MIS'}.</h2><p>مدّة الجلسة {dueSchedule.duration} دقيقة. ابدأ عندما تكون مستعداً؛ يمكنك تأجيل التذكير أو إغلاقه.</p><div className="schedule-alert-actions"><button className="primary-button" onClick={() => startScheduledLesson(dueSchedule)}>ابدأ الدرس <ArrowUpRight size={16} /></button><button className="secondary-button" onClick={() => snoozeSchedule(dueSchedule)}>ذكّرني بعد 10 دقائق</button><button className="dismiss-button" onClick={() => setDueSchedule(null)}>إغلاق التذكير</button></div></div></div>}

        {focusSession ? (
          <section className="focus-view"><button className="back-link" onClick={stopFocusSession}><ArrowLeft size={16} /> العودة للمسار</button><div className="focus-head"><span className={`lesson-icon ${sessionLesson.color}`}><LessonIcon size={21} /></span><span className="eyebrow">{sessionLesson.intensive ? 'جلسة مكثفة' : 'جلسة تدريب'} · {sessionDurationMinutes} دقيقة · {sessionLesson.level}</span><span className="focus-lock"><LockKeyhole size={14} /> داخل التطبيق فقط</span></div><h1>فكّر كمتخصص، وتحدّث بالإنجليزية.</h1><p className="focus-subtitle">{sessionLesson.prompt}</p><div className="focus-timer"><Clock3 size={19} /><strong>{formattedTime}</strong><span>وقت الجلسة المتبقي</span><button onClick={stopFocusSession} aria-label="إيقاف الجلسة"><X size={16} /></button></div>
            <div className="lesson-workspace"><div className="task-panel"><div className="panel-label"><span className="step-number">01</span><span>افهم السياق</span><span className="step-done"><Check size={14} /></span></div><h2>{sessionLesson.task}</h2><p className="arabic-hint">{sessionLesson.translation}</p><div className="example-sentence"><span className="example-label">استمع إلى المثال</span><p dir="ltr">“{sessionLesson.sentence}”</p><button onClick={speakSentence} aria-label="استمع إلى الجملة"><Volume2 size={18} /></button></div><div className="vocab-row"><span>مصطلحات مفيدة</span>{sessionLesson.words.slice(0, 3).map((word) => <code key={word}>{word}</code>)}</div></div>
              <div className="response-panel">
                <div className="panel-label"><span className="step-number coral-step">02</span><span>قدّم إجابتك</span><span className="optional-label">اختر طريقة</span></div>
                <div className="input-mode"><button className={inputMode === 'speak' ? 'mode-active' : ''} onClick={() => switchInputMode('speak')}><Mic size={15} /> تحدث</button><button className={inputMode === 'write' ? 'mode-active' : ''} onClick={() => switchInputMode('write')}><BookOpen size={15} /> اكتب</button></div>
                {inputMode === 'speak' ? <>
                  <div className={`record-zone ${isRecording ? 'recording' : ''}`}>
                    <button className="record-button" onClick={toggleRecording} aria-label={isRecording ? 'إيقاف التسجيل' : 'ابدأ التسجيل'}>{isRecording ? <Square size={20} fill="currentColor" /> : <Mic size={24} />}</button>
                    <strong>{isRecording ? 'التسجيل يعمل الآن' : audioUrl ? 'تم تسجيل إجابتك' : 'ابدأ تسجيل إجابتك'}</strong>
                    <span>{isRecording ? `اضغط للإيقاف · ${String(Math.floor(recordingSeconds / 60)).padStart(2, '0')}:${String(recordingSeconds % 60).padStart(2, '0')}` : 'استخدم جملتين أو ثلاثاً بالإنجليزية'}</span>
                    {isRecording && <span className="record-bars"><i /><i /><i /><i /><i /><i /><i /></span>}
                  </div>
                  <button className="text-link write-instead" onClick={() => switchInputMode('write')}>أو اكتب إجابتك بدلاً من ذلك</button>
                </> : <>
                  <label className="answer-label" htmlFor="lesson-answer">اكتب إجابتك بالإنجليزية</label><textarea id="lesson-answer" value={answer} onChange={(event) => setAnswer(event.target.value)} dir="ltr" placeholder="Write your explanation in English..." rows={5} /><button className="review-button" onClick={reviewAnswer}>راجع إجابتي <ArrowUpRight size={16} /></button>
                </>}
                <label className="audio-import"><Headphones size={14} /> استيراد تسجيل من الهاتف<input type="file" accept="audio/*" capture="user" onChange={importAudio} /></label>
                {audioUrl && <div className="audio-preview"><div className="audio-preview-title"><span><AudioLines size={16} /><strong>معاينة التسجيل</strong></span><button onClick={deleteRecording} aria-label="حذف التسجيل"><X size={16} /></button></div><audio controls preload="metadata" src={audioUrl} onLoadedMetadata={(event) => { if (Number.isFinite(event.currentTarget.duration)) setRecordingSeconds(Math.floor(event.currentTarget.duration)) }}>المتصفح لا يدعم تشغيل الصوت.</audio><div className="audio-preview-actions"><button className="review-button" onClick={deleteRecording}><RotateCcw size={14} /> تسجيل مرة أخرى</button><a className="download-audio" href={audioUrl} download={audioFileName} aria-label="تنزيل التسجيل"><Download size={15} /> تنزيل</a></div></div>}
                {feedback && <div className="feedback-box"><Sparkles size={16} /><span>{feedback}</span></div>}
              </div></div>
            <div className="focus-footer"><div className="privacy-note"><ShieldCheck size={16} /><span>لا يحفظ التطبيق الصوت؛ قد يعالجه المتصفح.</span></div><button className="complete-button" onClick={finishLesson}>{completed ? 'تم إنجاز المهمة' : 'أنهيت المهمة'} <Check size={16} /></button></div>
          </section>
        ) : section === 'today' ? (
          <div className="page-content"><section className="welcome-row"><div><div className="date-kicker">{new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())} <span className="date-line" /></div><h1>صباح التقدّم، {profile.name}<span className="heading-period">.</span></h1><p>كل جلسة تقرّبك من التحدث بثقة في تخصصك.</p></div><div className="week-progress"><div className="week-progress-copy"><span>هدفك الأسبوعي</span><strong>3 <small>/ 5 جلسات</small></strong></div><div className="week-track"><span /></div></div></section>
            <section className="challenge-banner"><div className="challenge-copy"><div className="challenge-kicker"><span className="challenge-icon"><Target size={15} /></span> تحدّي اليوم <span className="challenge-time"><Clock3 size={13} /> 1 دقيقة</span></div><h2>اشرح مفهوم <b>SQL</b> بصوت واضح.</h2><p>تحدّث كأنك تشرح لزميلك كيف تسترجع بيانات من قاعدة بيانات.</p><button className="challenge-cta" onClick={() => startFocusSession(dailyChallenge)}>ابدأ التحدّي <ArrowUpRight size={16} /></button></div><div className="challenge-visual" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit-core"><Database size={29} /></div><span className="float-chip chip-sql">SELECT *</span><span className="float-chip chip-db">FROM database</span><span className="visual-dot dot-one" /><span className="visual-dot dot-two" /></div><span className="challenge-index">01 <span>/ 03</span></span></section>
            <section className="schedule-panel"><div className="schedule-panel-heading"><div><span className="section-kicker">خطّة أسبوعك</span><h2>مواعيد دروسي</h2></div><div className="schedule-actions"><button className="notification-button" onClick={enableNotifications} disabled={notificationPermission === 'granted' || notificationPermission === 'unsupported'}><Bell size={15} />{notificationPermission === 'granted' ? 'التنبيهات مفعّلة' : notificationPermission === 'denied' ? `فعّلها من إعدادات ${Capacitor.isNativePlatform() ? 'التطبيق' : 'المتصفح'}` : `تفعيل تنبيه ${Capacitor.isNativePlatform() ? 'الجهاز' : 'المتصفح'}`}</button><button className="add-schedule-button" onClick={() => setShowScheduleForm((visible) => !visible)}><CalendarPlus size={16} /> إضافة موعد</button></div></div>
              {showScheduleForm && <form className="schedule-form" onSubmit={saveSchedule}><label>الدرس<select value={scheduleLessonId} onChange={(event) => setScheduleLessonId(event.target.value)}>{lessons.map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.categoryLabel} · {lesson.unit} · {lesson.level}</option>)}</select></label><label>اليوم<select value={scheduleWeekday} onChange={(event) => setScheduleWeekday(Number(event.target.value))}>{weekdayNames.map((day, index) => <option key={day} value={index}>{day}</option>)}</select></label><label>الوقت<input type="time" required value={scheduleTime} onChange={(event) => setScheduleTime(event.target.value)} /></label><label>المدة بالدقائق<input type="number" min="5" max="180" step="5" required value={scheduleDuration} onChange={(event) => setScheduleDuration(Number(event.target.value))} /></label><button className="primary-button" type="submit">حفظ الموعد <Check size={15} /></button></form>}
              {schedules.length === 0 ? <p className="schedule-empty">لم تضف مواعيد بعد. اختر يوم الدرس ووقته ومدته.</p> : <div className="schedule-list">{schedules.map((schedule) => { const lesson = lessons.find((item) => item.id === schedule.lessonId); return <div className="schedule-row" key={schedule.id}><span className="schedule-day">{weekdayNames[schedule.weekday]}</span><strong dir="ltr">{schedule.time}</strong><span className="schedule-row-title">{lesson?.unit ?? 'درس MIS'}</span><span className="schedule-duration">{schedule.duration} دقيقة</span><button onClick={() => removeSchedule(schedule.id)} aria-label={`حذف موعد ${weekdayNames[schedule.weekday]}`}><X size={16} /></button></div> })}</div>}
              <p className="schedule-disclaimer"><ShieldCheck size={14} />{Capacitor.isNativePlatform() ? 'يرسل Android إشعاراً محلياً عند السماح. قد تتأثر الدقة بإعدادات البطارية؛ التطبيق لا يفتح نفسه أو يقفل الهاتف.' : 'تذكير الويب يعمل والصفحة مفتوحة فقط. المتصفح لا يفتح التطبيق إجبارياً ولا يمنع الخروج.'}</p>
            </section>
            <button className="intensive-promo" onClick={() => { setSelectedCategory('all'); setSelectedLevel('all'); setSelectedFormat('intensive'); setSection('path') }}><span className="intensive-promo-icon"><Target size={20} /></span><span><strong>المسار المكثّف</strong><small>4 مشروعات تخصصية · مستوى C1 · 25 دقيقة لكل مشروع</small></span><ArrowLeft size={18} /></button>
            <div className="section-heading"><div><span className="section-kicker">رحلتك الدراسية</span><h2>كمّل من حيث توقّفت</h2></div><button className="text-link" onClick={() => changeSection('path')}>كل المسارات <ArrowLeft size={15} /></button></div>
            <div className="dashboard-grid"><section className="continue-card"><div className="continue-top"><span className={`lesson-icon ${selectedLesson.color}`}><LessonIcon size={20} /></span><span className="continue-category">{selectedLesson.unit}</span><button className="more-button" aria-label="خيارات المسار"><Menu size={18} /></button></div><h3>{selectedLesson.title}</h3><p className="continue-description">تعلّم المصطلحات من خلال بناء حلّ حقيقي، خطوة بخطوة.</p><div className="lesson-progress-line"><div className="progress-track"><span style={{ width: `${selectedLesson.progress}%` }} /></div><span>{selectedLesson.progress}%</span></div><div className="continue-bottom"><div className="lesson-meta"><span><Clock3 size={14} /> {selectedLesson.duration}</span><span><Headphones size={14} /> استماع + تحدث</span></div><button className="round-arrow" onClick={() => startFocusSession()} aria-label="تابع الدرس"><ArrowLeft size={18} /></button></div></section>
              <section className="weekly-card"><div className="card-heading"><div><span className="section-kicker">ثباتك يصنع الفرق</span><h3>نشاطك هذا الأسبوع</h3></div><button className="icon-button" aria-label="خيارات الرسم"><Menu size={17} /></button></div><div className="chart-area"><div className="chart-y-labels"><span>60</span><span>40</span><span>20</span><span>0</span></div><div className="chart-plot"><div className="chart-gridlines"><i /><i /><i /><i /></div><div className="bar-set">{[{ day: 'س', height: 35 }, { day: 'ح', height: 70 }, { day: 'ن', height: 52 }, { day: 'ث', height: 88 }, { day: 'ر', height: 62 }, { day: 'خ', height: 100 }, { day: 'ج', height: 24 }].map((item, index) => <div className="bar-column" key={item.day}><span className={`bar ${index === 5 ? 'bar-today' : ''}`} style={{ height: `${item.height}%` }} /><small>{item.day}</small></div>)}</div></div></div><div className="chart-foot"><span><i className="legend-dot" /> دقائق التعلّم</span><strong>+18% <ArrowUpRight size={14} /></strong></div></section></div>
            <div className="section-heading module-heading"><div><span className="section-kicker">تعلّم عبر التخصص</span><h2>مساراتك في MIS</h2></div><span className="module-count">{lessons.length} درس</span></div><div className="path-grid">{featuredLessons.map((lesson) => { const Icon = lesson.icon; return <button className="path-card" key={lesson.id} onClick={() => selectLesson(lesson)}><span className={`lesson-icon ${lesson.color}`}><Icon size={19} /></span><span className="path-card-copy"><strong>{lesson.title}</strong><small>{lesson.categoryLabel} · {lesson.level} · {lesson.progress}%</small></span><ChevronLeft size={17} className="path-chevron" /></button> })}</div><footer className="page-note"><LockKeyhole size={14} /> تركيز اختياري داخل التطبيق <span /> بياناتك التعليمية محفوظة على جهازك</footer>
          </div>
        ) : section === 'path' ? (
          <div className="page-content inner-page">
            <div className="inner-page-heading"><span className="section-kicker">تعلم من خلال مشاريع واقعية</span><h1>مسارات MIS</h1><p>اختر المجال والمستوى المناسبين، ثم ابدأ التدريب بمشروع عملي.</p></div>
            <div className="category-filters" aria-label="تصنيف المسارات">
              {categories.map((category) => <button key={category.id} className={selectedCategory === category.id ? 'category-active' : ''} onClick={() => setSelectedCategory(category.id)}>{category.label}<span>{category.id === 'all' ? lessons.length : lessons.filter((lesson) => lesson.category === category.id).length}</span></button>)}
            </div>
            <div className="lesson-filter-panel"><div className="level-filter-row"><span>مستوى الإنجليزية</span><div className="level-filter-options">{proficiencyLevels.map((level) => <button key={level} className={selectedLevel === level ? 'selected-filter' : ''} onClick={() => setSelectedLevel(level)}>{level === 'all' ? 'كل المستويات' : level}<span>{level === 'all' ? lessons.length : lessons.filter((lesson) => lesson.level === level).length}</span></button>)}</div></div><div className="format-filter-row"><span>نوع الوحدة</span><div className="format-toggle"><button className={selectedFormat === 'all' ? 'selected-filter' : ''} onClick={() => setSelectedFormat('all')}>كل الدروس</button><button className={selectedFormat === 'intensive' ? 'selected-filter' : ''} onClick={() => setSelectedFormat('intensive')}>دروس مكثفة <span>{lessons.filter((lesson) => lesson.intensive).length}</span></button></div></div></div>
            <p className="catalog-result-count">يعرض {filteredLessons.length} من {lessons.length} درس</p>
            <div className="path-list">{filteredLessons.map((lesson, index) => { const Icon = lesson.icon; return <button className={`path-list-card ${selectedLesson.id === lesson.id ? 'selected' : ''}`} key={lesson.id} onClick={() => selectLesson(lesson)}><span className="path-order">{String(index + 1).padStart(2, '0')}</span><span className={`lesson-icon ${lesson.color}`}><Icon size={21} /></span><span className="path-list-copy"><strong>{lesson.unit}</strong><span className="path-classification"><small>{lesson.title}</small><small className="level-badge">{lesson.level}</small>{lesson.intensive && <small className="intensive-badge">مكثف · 25 د</small>}</span><span className="progress-track"><i style={{ width: `${lesson.progress}%` }} /></span></span><span className="path-list-progress">{lesson.progress}%</span><ChevronLeft size={18} /></button> })}</div>
            {filteredLessons.length === 0 && <p className="empty-category">لا توجد مسارات في هذا التصنيف بعد.</p>}
            <section className="selected-lesson-panel"><div><span className="section-kicker">{selectedLesson.categoryLabel} · المستوى {selectedLesson.level}{selectedLesson.intensive ? ' · درس مكثف' : ''}</span><h2>{selectedLesson.task}</h2><p>{selectedLesson.translation}</p><div className="skill-pills"><span>فهم السياق</span><span>كتابة أكاديمية</span><span>تحدث</span></div></div><button className="primary-button" onClick={() => startFocusSession()}>ابدأ الوحدة <ArrowUpRight size={16} /></button></section>
          </div>
        ) : (
          <div className="page-content inner-page progress-page"><div className="inner-page-heading"><span className="section-kicker">أنت تتحسن، خطوة بعد خطوة</span><h1>تقدّمك يتكلم.</h1><p>التركيز على ما تستطيع فعله باللغة، لا على عدد الكلمات التي حفظتها.</p></div><div className="stats-grid"><div className="stat-card"><span className="stat-icon mint-icon"><Flame size={19} /></span><span>أيام متتالية</span><strong>6 <small>أيام</small></strong><small className="stat-foot">أفضل سلسلة: 9 أيام</small></div><div className="stat-card"><span className="stat-icon yellow-icon"><Trophy size={19} /></span><span>نقاط الخبرة</span><strong>{xp.toLocaleString('en-US')} <small>XP</small></strong><small className="stat-foot">المستوى 4 · محلل مبتدئ</small></div><div className="stat-card"><span className="stat-icon peach-icon"><Check size={19} /></span><span>وحدات مكتملة</span><strong>{completed ? '13' : '12'} <small>/ {lessons.length}</small></strong><small className="stat-foot">+ وحدة هذا الأسبوع</small></div></div><section className="skills-panel"><div className="card-heading"><div><span className="section-kicker">مهاراتك العملية</span><h3>أين أصبح أداؤك؟</h3></div><span className="sample-tag">بيانات نموذجية</span></div>{[{ label: 'فهم المصطلحات التقنية', value: 76, color: 'skill-green' }, { label: 'الكتابة الأكاديمية', value: 58, color: 'skill-coral' }, { label: 'التحدث بثقة', value: 43, color: 'skill-yellow' }, { label: 'شرح القرارات', value: 67, color: 'skill-dark' }].map((skill) => <div className="skill-row" key={skill.label}><span>{skill.label}</span><div className="skill-track"><i className={skill.color} style={{ width: `${skill.value}%` }} /></div><strong>{skill.value}%</strong></div>)}</section><button className="primary-button progress-cta" onClick={() => changeSection('today')}>ارجع لتحدي اليوم <ArrowLeft size={16} /></button></div>
        )}

        <nav className="mobile-nav" aria-label="التنقل السفلي">{navItems.map(({ id, label, icon: Icon }) => <button key={id} className={section === id ? 'mobile-active' : ''} onClick={() => changeSection(id)}><Icon size={19} /><span>{label}</span></button>)}</nav>
      </main>
    </div>
  )
}

export default App
