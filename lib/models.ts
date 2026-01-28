import mongoose, { Schema, Model, models } from 'mongoose';

// --- Job Position Schema ---
export interface IJob {
    _id?: string;
    title: string;
    description?: string;
    requirements?: string[];
    location?: string;
    type?: string;
    created_date?: Date;
    active: boolean;
}

const JobSchema = new Schema<IJob>({
    title: { type: String, required: true },
    description: { type: String },
    requirements: { type: [String] },
    location: { type: String },
    type: { type: String },
    created_date: { type: Date, default: Date.now, index: true },
    active: { type: Boolean, default: true },
});

export const Job: Model<IJob> = models.Job || mongoose.model<IJob>('Job', JobSchema);

// --- Candidate Schema ---
export interface ICandidate {
    _id?: string;
    user_id?: string;
    full_name: string;
    email: string;
    phone: string;
    source?: string;
    source_details?: string;
    occupation?: string;
    address?: string;
    languages?: string;
    community?: string;
    other_details?: string;
    years_editing?: string;
    institutions?: string;
    books_edited?: string;

    // Payment Info
    payment_method?: string;
    bank_name?: string;
    account_number?: string;
    routing_number?: string;
    iban?: string;
    swift_code?: string;
    paypal_email?: string;

    // Status & Analysis
    status: 'new' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected' | 'archived';
    priority: 'low' | 'medium' | 'high';
    score?: number;
    skills?: { name: string; status: 'unverified' | 'verified' | 'certified' }[];
    matched_jobs?: string[];

    // Resume & Analysis
    resume_text?: string;
    analysis?: any;
    notes?: string;

    // TYPING SKILLS (13 fields)
    typing_handwriting_yiddish?: string;
    typing_handwriting_hebrew?: string;
    typing_difficult_handwriting?: string;
    typing_recordings?: string;
    typing_corrections_no_errors?: string;
    typing_special_fonts?: string;
    typing_translation?: string;
    typing_yiddish_to_hebrew?: string;
    typing_hebrew_to_yiddish?: string;
    typing_extract_hebrew?: string;
    typing_english_to_yiddish?: string;
    typing_english_to_hebrew?: string;
    typing_other_languages?: string;

    // WRITING HEBREW (7 fields)
    writing_hebrew_chassidic_style?: string;
    writing_hebrew_learning_style?: string;
    writing_hebrew_halacha_style?: string;
    writing_hebrew_mussar_style?: string;
    writing_hebrew_stories_style?: string;
    writing_hebrew_introduction?: string;
    writing_hebrew_biography?: string;

    // PROOFREADING HEBREW (3 fields)
    proofreading_hebrew_typing_errors?: string;
    proofreading_hebrew_punctuation?: string;
    proofreading_hebrew_final_proofing?: string;

    // EDITING HEBREW (7 fields)
    editing_hebrew_content_organization?: string;
    editing_hebrew_references?: string;
    editing_hebrew_general?: string;
    editing_hebrew_titles?: string;
    editing_hebrew_language_improvement?: string;
    editing_hebrew_explanations?: string;
    editing_hebrew_content_review?: string;

    // WRITING YIDDISH (7 fields)
    writing_yiddish_chassidic_style?: string;
    writing_yiddish_learning_style?: string;
    writing_yiddish_halacha_style?: string;
    writing_yiddish_mussar_style?: string;
    writing_yiddish_stories_style?: string;
    writing_yiddish_introduction?: string;
    writing_yiddish_biography?: string;

    // PROOFREADING YIDDISH (3 fields)
    proofreading_yiddish_typing_errors?: string;
    proofreading_yiddish_punctuation?: string;
    proofreading_yiddish_final_proofing?: string;

    // EDITING YIDDISH (7 fields)
    editing_yiddish_content_organization?: string;
    editing_yiddish_references?: string;
    editing_yiddish_general?: string;
    editing_yiddish_titles?: string;
    editing_yiddish_language_improvement?: string;
    editing_yiddish_explanations?: string;
    editing_yiddish_content_review?: string;

    // OTHER WORK (4 fields)
    other_work_source_index?: string;
    other_work_subject_index?: string;
    other_work_biographies?: string;
    other_work_collection_from_books?: string;

    // GRAPHIC LAYOUT (3 fields)
    graphic_layout_page_layout?: string;
    graphic_layout_cover_design?: string;
    graphic_layout_illustrations?: string;

    // SUBJECT EXPERTISE - TORAH & MUSSAR (14 fields)
    subject_tanach?: string;
    subject_drush_agada?: string;
    subject_maharal?: string;
    subject_kabbalah?: string;
    subject_ramchal?: string;
    subject_mussar?: string;
    subject_jewish_history?: string;
    subject_chassidus?: string;
    subject_jewish_history_stories?: string;
    subject_tzaddik_stories?: string;
    subject_lineage?: string;
    subject_yahrtzeits?: string;
    subject_hashkafa?: string;
    subject_kanaos?: string;

    // SUBJECT EXPERTISE - GEMARA (38 fields)
    subject_gemara_general?: string;
    subject_berachos?: string;
    subject_shabbos?: string;
    subject_eruvin?: string;
    subject_pesachim?: string;
    subject_rosh_hashana?: string;
    subject_yoma?: string;
    subject_sukkah?: string;
    subject_beitzah?: string;
    subject_taanis?: string;
    subject_megillah?: string;
    subject_moed_katan?: string;
    subject_chagigah?: string;
    subject_yevamos?: string;
    subject_kesubos?: string;
    subject_nedarim?: string;
    subject_nazir?: string;
    subject_sotah?: string;
    subject_gittin?: string;
    subject_kiddushin?: string;
    subject_bava_kamma?: string;
    subject_bava_metzia?: string;
    subject_bava_basra?: string;
    subject_sanhedrin?: string;
    subject_makkos?: string;
    subject_shevuos?: string;
    subject_avodah_zarah?: string;
    subject_horayos?: string;
    subject_zevachim?: string;
    subject_menachos?: string;
    subject_chullin?: string;
    subject_bechoros?: string;
    subject_arachin?: string;
    subject_temurah?: string;
    subject_kerisos?: string;
    subject_meilah?: string;
    subject_niddah?: string;

    // SUBJECT EXPERTISE - SHULCHAN ARUCH (4 fields)
    subject_shulchan_aruch_orach_chaim?: string;
    subject_shulchan_aruch_yoreh_deah?: string;
    subject_shulchan_aruch_even_haezer?: string;
    subject_shulchan_aruch_choshen_mishpat?: string;

    // SOFTWARE SKILLS (8 fields)
    software_word?: string;
    software_excel?: string;
    software_tag?: string;
    software_indesign?: string;
    software_otzar_hachochma?: string;
    software_otzaros_hatorah?: string;
    software_dbs?: string;
    software_bar_ilan?: string;

    created_date: Date;
    updated_date: Date;
}

const CandidateSchema = new Schema<ICandidate>({
    user_id: { type: String, index: true },
    full_name: { type: String, required: true },
    email: { type: String, index: true },
    phone: { type: String },
    source: { type: String },
    source_details: { type: String },
    occupation: { type: String },
    address: { type: String },
    languages: { type: String },
    community: { type: String },
    other_details: { type: String },
    years_editing: { type: String },
    institutions: { type: String },
    books_edited: { type: String },

    payment_method: { type: String },
    bank_name: { type: String },
    account_number: { type: String },
    routing_number: { type: String },
    iban: { type: String },
    swift_code: { type: String },
    paypal_email: { type: String },

    status: {
        type: String,
        enum: ['new', 'screening', 'interview', 'offer', 'hired', 'rejected', 'archived'],
        default: 'new'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    score: { type: Number },
    skills: [{
        name: { type: String, required: true },
        status: {
            type: String,
            enum: ['unverified', 'verified', 'certified'],
            default: 'unverified'
        }
    }],
    matched_jobs: { type: [String] },

    resume_text: { type: String },
    analysis: { type: Schema.Types.Mixed },
    notes: { type: String },

    // TYPING SKILLS - All 13 fields as individual String columns
    typing_handwriting_yiddish: { type: String },
    typing_handwriting_hebrew: { type: String },
    typing_difficult_handwriting: { type: String },
    typing_recordings: { type: String },
    typing_corrections_no_errors: { type: String },
    typing_special_fonts: { type: String },
    typing_translation: { type: String },
    typing_yiddish_to_hebrew: { type: String },
    typing_hebrew_to_yiddish: { type: String },
    typing_extract_hebrew: { type: String },
    typing_english_to_yiddish: { type: String },
    typing_english_to_hebrew: { type: String },
    typing_other_languages: { type: String },

    // WRITING HEBREW - All 7 fields
    writing_hebrew_chassidic_style: { type: String },
    writing_hebrew_learning_style: { type: String },
    writing_hebrew_halacha_style: { type: String },
    writing_hebrew_mussar_style: { type: String },
    writing_hebrew_stories_style: { type: String },
    writing_hebrew_introduction: { type: String },
    writing_hebrew_biography: { type: String },

    // PROOFREADING HEBREW - All 3 fields
    proofreading_hebrew_typing_errors: { type: String },
    proofreading_hebrew_punctuation: { type: String },
    proofreading_hebrew_final_proofing: { type: String },

    // EDITING HEBREW - All 7 fields
    editing_hebrew_content_organization: { type: String },
    editing_hebrew_references: { type: String },
    editing_hebrew_general: { type: String },
    editing_hebrew_titles: { type: String },
    editing_hebrew_language_improvement: { type: String },
    editing_hebrew_explanations: { type: String },
    editing_hebrew_content_review: { type: String },

    // WRITING YIDDISH - All 7 fields
    writing_yiddish_chassidic_style: { type: String },
    writing_yiddish_learning_style: { type: String },
    writing_yiddish_halacha_style: { type: String },
    writing_yiddish_mussar_style: { type: String },
    writing_yiddish_stories_style: { type: String },
    writing_yiddish_introduction: { type: String },
    writing_yiddish_biography: { type: String },

    // PROOFREADING YIDDISH - All 3 fields
    proofreading_yiddish_typing_errors: { type: String },
    proofreading_yiddish_punctuation: { type: String },
    proofreading_yiddish_final_proofing: { type: String },

    // EDITING YIDDISH - All 7 fields
    editing_yiddish_content_organization: { type: String },
    editing_yiddish_references: { type: String },
    editing_yiddish_general: { type: String },
    editing_yiddish_titles: { type: String },
    editing_yiddish_language_improvement: { type: String },
    editing_yiddish_explanations: { type: String },
    editing_yiddish_content_review: { type: String },

    // OTHER WORK - All 4 fields
    other_work_source_index: { type: String },
    other_work_subject_index: { type: String },
    other_work_biographies: { type: String },
    other_work_collection_from_books: { type: String },

    // GRAPHIC LAYOUT - All 3 fields
    graphic_layout_page_layout: { type: String },
    graphic_layout_cover_design: { type: String },
    graphic_layout_illustrations: { type: String },

    // SUBJECT EXPERTISE - TORAH & MUSSAR - All 14 fields
    subject_tanach: { type: String },
    subject_drush_agada: { type: String },
    subject_maharal: { type: String },
    subject_kabbalah: { type: String },
    subject_ramchal: { type: String },
    subject_mussar: { type: String },
    subject_jewish_history: { type: String },
    subject_chassidus: { type: String },
    subject_jewish_history_stories: { type: String },
    subject_tzaddik_stories: { type: String },
    subject_lineage: { type: String },
    subject_yahrtzeits: { type: String },
    subject_hashkafa: { type: String },
    subject_kanaos: { type: String },

    // SUBJECT EXPERTISE - GEMARA - All 38 fields
    subject_gemara_general: { type: String },
    subject_berachos: { type: String },
    subject_shabbos: { type: String },
    subject_eruvin: { type: String },
    subject_pesachim: { type: String },
    subject_rosh_hashana: { type: String },
    subject_yoma: { type: String },
    subject_sukkah: { type: String },
    subject_beitzah: { type: String },
    subject_taanis: { type: String },
    subject_megillah: { type: String },
    subject_moed_katan: { type: String },
    subject_chagigah: { type: String },
    subject_yevamos: { type: String },
    subject_kesubos: { type: String },
    subject_nedarim: { type: String },
    subject_nazir: { type: String },
    subject_sotah: { type: String },
    subject_gittin: { type: String },
    subject_kiddushin: { type: String },
    subject_bava_kamma: { type: String },
    subject_bava_metzia: { type: String },
    subject_bava_basra: { type: String },
    subject_sanhedrin: { type: String },
    subject_makkos: { type: String },
    subject_shevuos: { type: String },
    subject_avodah_zarah: { type: String },
    subject_horayos: { type: String },
    subject_zevachim: { type: String },
    subject_menachos: { type: String },
    subject_chullin: { type: String },
    subject_bechoros: { type: String },
    subject_arachin: { type: String },
    subject_temurah: { type: String },
    subject_kerisos: { type: String },
    subject_meilah: { type: String },
    subject_niddah: { type: String },

    // SUBJECT EXPERTISE - SHULCHAN ARUCH - All 4 fields
    subject_shulchan_aruch_orach_chaim: { type: String },
    subject_shulchan_aruch_yoreh_deah: { type: String },
    subject_shulchan_aruch_even_haezer: { type: String },
    subject_shulchan_aruch_choshen_mishpat: { type: String },

    // SOFTWARE SKILLS - All 8 fields
    software_word: { type: String },
    software_excel: { type: String },
    software_tag: { type: String },
    software_indesign: { type: String },
    software_otzar_hachochma: { type: String },
    software_otzaros_hatorah: { type: String },
    software_dbs: { type: String },
    software_bar_ilan: { type: String },

    created_date: { type: Date, default: Date.now, index: true },
    updated_date: { type: Date, default: Date.now },
});

export const Candidate: Model<ICandidate> = models.Candidate || mongoose.model<ICandidate>('Candidate', CandidateSchema);
