import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Loader2 } from "lucide-react";
import { base44 } from "@/lib/api-client";

interface ScoreInputProps {
    value: any;
    onChange: (val: string) => void;
    label: string;
}

const ScoreInput = ({ value, onChange, label }: ScoreInputProps) => (
    <div className="space-y-1">
        <label className="text-xs text-slate-600">{label}</label>
        <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="0-100 or n/e"
            className="h-8 text-sm"
        />
    </div>
);

interface SectionInputsProps {
    data: any;
    onChange: (data: any) => void;
    fields: { key: string; label: string }[];
}

const SectionInputs = ({ data, onChange, fields }: SectionInputsProps) => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {fields.map(({ key, label }) => (
            <ScoreInput
                key={key}
                label={label}
                value={data?.[key]}
                onChange={(val) => onChange({ ...data, [key]: val })}
            />
        ))}
    </div>
);

interface AssessmentFormProps {
    candidate: any;
    onUpdate?: () => void;
}

// Helper to build initial form state from FLAT candidate fields (DB schema)
const buildInitialFormData = (candidate: any) => ({
    occupation: candidate.occupation || '',
    address: candidate.address || '',
    languages: candidate.languages || '',
    community: candidate.community || '',
    other_details: candidate.other_details || '',
    years_editing: candidate.years_editing || '',
    institutions: candidate.institutions || '',
    books_edited: candidate.books_edited || '',

    // Nested objects for the UI, sourced from flat DB columns
    typing_skills: {
        handwriting_yiddish: candidate.typing_handwriting_yiddish || '',
        handwriting_hebrew: candidate.typing_handwriting_hebrew || '',
        difficult_handwriting: candidate.typing_difficult_handwriting || '',
        recordings: candidate.typing_recordings || '',
        corrections_no_errors: candidate.typing_corrections_no_errors || '',
        special_fonts: candidate.typing_special_fonts || '',
        translation: candidate.typing_translation || '',
        yiddish_to_hebrew: candidate.typing_yiddish_to_hebrew || '',
        hebrew_to_yiddish: candidate.typing_hebrew_to_yiddish || '',
        extract_hebrew: candidate.typing_extract_hebrew || '',
        english_to_yiddish: candidate.typing_english_to_yiddish || '',
        english_to_hebrew: candidate.typing_english_to_hebrew || '',
        other_languages: candidate.typing_other_languages || ''
    },
    writing_hebrew: {
        chassidic_style: candidate.writing_hebrew_chassidic_style || '',
        learning_style: candidate.writing_hebrew_learning_style || '',
        halacha_style: candidate.writing_hebrew_halacha_style || '',
        mussar_style: candidate.writing_hebrew_mussar_style || '',
        stories_style: candidate.writing_hebrew_stories_style || '',
        introduction: candidate.writing_hebrew_introduction || '',
        biography: candidate.writing_hebrew_biography || ''
    },
    proofreading_hebrew: {
        typing_errors: candidate.proofreading_hebrew_typing_errors || '',
        punctuation: candidate.proofreading_hebrew_punctuation || '',
        final_proofing: candidate.proofreading_hebrew_final_proofing || ''
    },
    editing_hebrew: {
        content_organization: candidate.editing_hebrew_content_organization || '',
        references: candidate.editing_hebrew_references || '',
        general: candidate.editing_hebrew_general || '',
        titles: candidate.editing_hebrew_titles || '',
        language_improvement: candidate.editing_hebrew_language_improvement || '',
        explanations: candidate.editing_hebrew_explanations || '',
        content_review: candidate.editing_hebrew_content_review || ''
    },
    writing_yiddish: {
        chassidic_style: candidate.writing_yiddish_chassidic_style || '',
        learning_style: candidate.writing_yiddish_learning_style || '',
        halacha_style: candidate.writing_yiddish_halacha_style || '',
        mussar_style: candidate.writing_yiddish_mussar_style || '',
        stories_style: candidate.writing_yiddish_stories_style || '',
        introduction: candidate.writing_yiddish_introduction || '',
        biography: candidate.writing_yiddish_biography || ''
    },
    proofreading_yiddish: {
        typing_errors: candidate.proofreading_yiddish_typing_errors || '',
        punctuation: candidate.proofreading_yiddish_punctuation || '',
        final_proofing: candidate.proofreading_yiddish_final_proofing || ''
    },
    editing_yiddish: {
        content_organization: candidate.editing_yiddish_content_organization || '',
        references: candidate.editing_yiddish_references || '',
        general: candidate.editing_yiddish_general || '',
        titles: candidate.editing_yiddish_titles || '',
        language_improvement: candidate.editing_yiddish_language_improvement || '',
        explanations: candidate.editing_yiddish_explanations || '',
        content_review: candidate.editing_yiddish_content_review || ''
    },
    other_work: {
        source_index: candidate.other_work_source_index || '',
        subject_index: candidate.other_work_subject_index || '',
        biographies: candidate.other_work_biographies || '',
        collection_from_books: candidate.other_work_collection_from_books || ''
    },
    graphic_layout: {
        page_layout: candidate.graphic_layout_page_layout || '',
        cover_design: candidate.graphic_layout_cover_design || '',
        illustrations: candidate.graphic_layout_illustrations || ''
    },
    subject_expertise: {
        // Torah & Mussar
        tanach: candidate.subject_tanach || '',
        drush_agada: candidate.subject_drush_agada || '',
        maharal: candidate.subject_maharal || '',
        kabbalah: candidate.subject_kabbalah || '',
        ramchal: candidate.subject_ramchal || '',
        mussar: candidate.subject_mussar || '',
        jewish_history: candidate.subject_jewish_history || '',
        chassidus: candidate.subject_chassidus || '',
        jewish_history_stories: candidate.subject_jewish_history_stories || '',
        tzaddik_stories: candidate.subject_tzaddik_stories || '',
        lineage: candidate.subject_lineage || '',
        yahrtzeits: candidate.subject_yahrtzeits || '',
        hashkafa: candidate.subject_hashkafa || '',
        kanaos: candidate.subject_kanaos || '',
        // Gemara
        gemara_general: candidate.subject_gemara_general || '',
        berachos: candidate.subject_berachos || '',
        shabbos: candidate.subject_shabbos || '',
        eruvin: candidate.subject_eruvin || '',
        pesachim: candidate.subject_pesachim || '',
        rosh_hashana: candidate.subject_rosh_hashana || '',
        yoma: candidate.subject_yoma || '',
        sukkah: candidate.subject_sukkah || '',
        beitzah: candidate.subject_beitzah || '',
        taanis: candidate.subject_taanis || '',
        megillah: candidate.subject_megillah || '',
        moed_katan: candidate.subject_moed_katan || '',
        chagigah: candidate.subject_chagigah || '',
        yevamos: candidate.subject_yevamos || '',
        kesubos: candidate.subject_kesubos || '',
        nedarim: candidate.subject_nedarim || '',
        nazir: candidate.subject_nazir || '',
        sotah: candidate.subject_sotah || '',
        gittin: candidate.subject_gittin || '',
        kiddushin: candidate.subject_kiddushin || '',
        bava_kamma: candidate.subject_bava_kamma || '',
        bava_metzia: candidate.subject_bava_metzia || '',
        bava_basra: candidate.subject_bava_basra || '',
        sanhedrin: candidate.subject_sanhedrin || '',
        makkos: candidate.subject_makkos || '',
        shevuos: candidate.subject_shevuos || '',
        avodah_zarah: candidate.subject_avodah_zarah || '',
        horayos: candidate.subject_horayos || '',
        zevachim: candidate.subject_zevachim || '',
        menachos: candidate.subject_menachos || '',
        chullin: candidate.subject_chullin || '',
        bechoros: candidate.subject_bechoros || '',
        arachin: candidate.subject_arachin || '',
        temurah: candidate.subject_temurah || '',
        kerisos: candidate.subject_kerisos || '',
        meilah: candidate.subject_meilah || '',
        niddah: candidate.subject_niddah || '',
        // Shulchan Aruch
        shulchan_aruch_orach_chaim: candidate.subject_shulchan_aruch_orach_chaim || '',
        shulchan_aruch_yoreh_deah: candidate.subject_shulchan_aruch_yoreh_deah || '',
        shulchan_aruch_even_haezer: candidate.subject_shulchan_aruch_even_haezer || '',
        shulchan_aruch_choshen_mishpat: candidate.subject_shulchan_aruch_choshen_mishpat || ''
    },
    software_skills: {
        word: candidate.software_word || '',
        excel: candidate.software_excel || '',
        tag: candidate.software_tag || '',
        indesign: candidate.software_indesign || '',
        otzar_hachochma: candidate.software_otzar_hachochma || '',
        otzaros_hatorah: candidate.software_otzaros_hatorah || '',
        dbs: candidate.software_dbs || '',
        bar_ilan: candidate.software_bar_ilan || ''
    }
});

export default function AssessmentForm({ candidate, onUpdate }: AssessmentFormProps) {
    const [saving, setSaving] = useState(false);
    // Initialize form data from flat DB fields so AI-extracted values appear in the UI
    const [formData, setFormData] = useState(buildInitialFormData(candidate));

    const handleSave = async () => {
        setSaving(true);
        try {
            console.log('[ASSESSMENT-FORM] Saving assessment data...');
            console.log('[ASSESSMENT-FORM] typing_skills:', formData.typing_skills);
            console.log('[ASSESSMENT-FORM] subject_expertise:', formData.subject_expertise);

            // Map nested UI state back into FLAT DB fields
            const payload: any = {
                occupation: formData.occupation,
                address: formData.address,
                languages: formData.languages,
                community: formData.community,
                other_details: formData.other_details,
                years_editing: formData.years_editing,
                institutions: formData.institutions,
                books_edited: formData.books_edited,

                // Typing
                typing_handwriting_yiddish: formData.typing_skills.handwriting_yiddish,
                typing_handwriting_hebrew: formData.typing_skills.handwriting_hebrew,
                typing_difficult_handwriting: formData.typing_skills.difficult_handwriting,
                typing_recordings: formData.typing_skills.recordings,
                typing_corrections_no_errors: formData.typing_skills.corrections_no_errors,
                typing_special_fonts: formData.typing_skills.special_fonts,
                typing_translation: formData.typing_skills.translation,
                typing_yiddish_to_hebrew: formData.typing_skills.yiddish_to_hebrew,
                typing_hebrew_to_yiddish: formData.typing_skills.hebrew_to_yiddish,
                typing_extract_hebrew: formData.typing_skills.extract_hebrew,
                typing_english_to_yiddish: formData.typing_skills.english_to_yiddish,
                typing_english_to_hebrew: formData.typing_skills.english_to_hebrew,
                typing_other_languages: formData.typing_skills.other_languages,

                // Writing / Proofreading / Editing - Hebrew
                writing_hebrew_chassidic_style: formData.writing_hebrew.chassidic_style,
                writing_hebrew_learning_style: formData.writing_hebrew.learning_style,
                writing_hebrew_halacha_style: formData.writing_hebrew.halacha_style,
                writing_hebrew_mussar_style: formData.writing_hebrew.mussar_style,
                writing_hebrew_stories_style: formData.writing_hebrew.stories_style,
                writing_hebrew_introduction: formData.writing_hebrew.introduction,
                writing_hebrew_biography: formData.writing_hebrew.biography,

                proofreading_hebrew_typing_errors: formData.proofreading_hebrew.typing_errors,
                proofreading_hebrew_punctuation: formData.proofreading_hebrew.punctuation,
                proofreading_hebrew_final_proofing: formData.proofreading_hebrew.final_proofing,

                editing_hebrew_content_organization: formData.editing_hebrew.content_organization,
                editing_hebrew_references: formData.editing_hebrew.references,
                editing_hebrew_general: formData.editing_hebrew.general,
                editing_hebrew_titles: formData.editing_hebrew.titles,
                editing_hebrew_language_improvement: formData.editing_hebrew.language_improvement,
                editing_hebrew_explanations: formData.editing_hebrew.explanations,
                editing_hebrew_content_review: formData.editing_hebrew.content_review,

                // Writing / Proofreading / Editing - Yiddish
                writing_yiddish_chassidic_style: formData.writing_yiddish.chassidic_style,
                writing_yiddish_learning_style: formData.writing_yiddish.learning_style,
                writing_yiddish_halacha_style: formData.writing_yiddish.halacha_style,
                writing_yiddish_mussar_style: formData.writing_yiddish.mussar_style,
                writing_yiddish_stories_style: formData.writing_yiddish.stories_style,
                writing_yiddish_introduction: formData.writing_yiddish.introduction,
                writing_yiddish_biography: formData.writing_yiddish.biography,

                proofreading_yiddish_typing_errors: formData.proofreading_yiddish.typing_errors,
                proofreading_yiddish_punctuation: formData.proofreading_yiddish.punctuation,
                proofreading_yiddish_final_proofing: formData.proofreading_yiddish.final_proofing,

                editing_yiddish_content_organization: formData.editing_yiddish.content_organization,
                editing_yiddish_references: formData.editing_yiddish.references,
                editing_yiddish_general: formData.editing_yiddish.general,
                editing_yiddish_titles: formData.editing_yiddish.titles,
                editing_yiddish_language_improvement: formData.editing_yiddish.language_improvement,
                editing_yiddish_explanations: formData.editing_yiddish.explanations,
                editing_yiddish_content_review: formData.editing_yiddish.content_review,

                // Other work
                other_work_source_index: formData.other_work.source_index,
                other_work_subject_index: formData.other_work.subject_index,
                other_work_biographies: formData.other_work.biographies,
                other_work_collection_from_books: formData.other_work.collection_from_books,

                // Graphic layout
                graphic_layout_page_layout: formData.graphic_layout.page_layout,
                graphic_layout_cover_design: formData.graphic_layout.cover_design,
                graphic_layout_illustrations: formData.graphic_layout.illustrations,

                // Subject expertise - Torah & Mussar
                subject_tanach: formData.subject_expertise.tanach,
                subject_drush_agada: formData.subject_expertise.drush_agada,
                subject_maharal: formData.subject_expertise.maharal,
                subject_kabbalah: formData.subject_expertise.kabbalah,
                subject_ramchal: formData.subject_expertise.ramchal,
                subject_mussar: formData.subject_expertise.mussar,
                subject_jewish_history: formData.subject_expertise.jewish_history,
                subject_chassidus: formData.subject_expertise.chassidus,
                subject_jewish_history_stories: formData.subject_expertise.jewish_history_stories,
                subject_tzaddik_stories: formData.subject_expertise.tzaddik_stories,
                subject_lineage: formData.subject_expertise.lineage,
                subject_yahrtzeits: formData.subject_expertise.yahrtzeits,
                subject_hashkafa: formData.subject_expertise.hashkafa,
                subject_kanaos: formData.subject_expertise.kanaos,

                // Subject expertise - Gemara
                subject_gemara_general: formData.subject_expertise.gemara_general,
                subject_berachos: formData.subject_expertise.berachos,
                subject_shabbos: formData.subject_expertise.shabbos,
                subject_eruvin: formData.subject_expertise.eruvin,
                subject_pesachim: formData.subject_expertise.pesachim,
                subject_rosh_hashana: formData.subject_expertise.rosh_hashana,
                subject_yoma: formData.subject_expertise.yoma,
                subject_sukkah: formData.subject_expertise.sukkah,
                subject_beitzah: formData.subject_expertise.beitzah,
                subject_taanis: formData.subject_expertise.taanis,
                subject_megillah: formData.subject_expertise.megillah,
                subject_moed_katan: formData.subject_expertise.moed_katan,
                subject_chagigah: formData.subject_expertise.chagigah,
                subject_yevamos: formData.subject_expertise.yevamos,
                subject_kesubos: formData.subject_expertise.kesubos,
                subject_nedarim: formData.subject_expertise.nedarim,
                subject_nazir: formData.subject_expertise.nazir,
                subject_sotah: formData.subject_expertise.sotah,
                subject_gittin: formData.subject_expertise.gittin,
                subject_kiddushin: formData.subject_expertise.kiddushin,
                subject_bava_kamma: formData.subject_expertise.bava_kamma,
                subject_bava_metzia: formData.subject_expertise.bava_metzia,
                subject_bava_basra: formData.subject_expertise.bava_basra,
                subject_sanhedrin: formData.subject_expertise.sanhedrin,
                subject_makkos: formData.subject_expertise.makkos,
                subject_shevuos: formData.subject_expertise.shevuos,
                subject_avodah_zarah: formData.subject_expertise.avodah_zarah,
                subject_horayos: formData.subject_expertise.horayos,
                subject_zevachim: formData.subject_expertise.zevachim,
                subject_menachos: formData.subject_expertise.menachos,
                subject_chullin: formData.subject_expertise.chullin,
                subject_bechoros: formData.subject_expertise.bechoros,
                subject_arachin: formData.subject_expertise.arachin,
                subject_temurah: formData.subject_expertise.temurah,
                subject_kerisos: formData.subject_expertise.kerisos,
                subject_meilah: formData.subject_expertise.meilah,
                subject_niddah: formData.subject_expertise.niddah,

                // Subject expertise - Shulchan Aruch
                subject_shulchan_aruch_orach_chaim: formData.subject_expertise.shulchan_aruch_orach_chaim,
                subject_shulchan_aruch_yoreh_deah: formData.subject_expertise.shulchan_aruch_yoreh_deah,
                subject_shulchan_aruch_even_haezer: formData.subject_expertise.shulchan_aruch_even_haezer,
                subject_shulchan_aruch_choshen_mishpat: formData.subject_expertise.shulchan_aruch_choshen_mishpat,

                // Software
                software_word: formData.software_skills.word,
                software_excel: formData.software_skills.excel,
                software_tag: formData.software_skills.tag,
                software_indesign: formData.software_skills.indesign,
                software_otzar_hachochma: formData.software_skills.otzar_hachochma,
                software_otzaros_hatorah: formData.software_skills.otzaros_hatorah,
                software_dbs: formData.software_skills.dbs,
                software_bar_ilan: formData.software_skills.bar_ilan
            };

            await base44.entities.Candidate.update(candidate._id || candidate.id, payload);
            console.log('[ASSESSMENT-FORM] Save successful');
            onUpdate?.();
        } catch (error) {
            console.error("Failed to save assessment", error);
        } finally {
            setSaving(false);
        }
    };

    const typingFields = [
        { key: 'handwriting_yiddish', label: 'כתבי יד - אידיש' },
        { key: 'handwriting_hebrew', label: 'כתבי יד - לשון הקודש' },
        { key: 'difficult_handwriting', label: 'שווערע כתבי ידות' },
        { key: 'recordings', label: 'טעיפס/רעקורדינגס' },
        { key: 'corrections_no_errors', label: 'הגהות בלי טעיות' },
        { key: 'special_fonts', label: 'ספעציעלע שריפטן' },
        { key: 'translation', label: 'תרגום' },
        { key: 'yiddish_to_hebrew', label: 'אידיש צו לשה"ק' },
        { key: 'hebrew_to_yiddish', label: 'לשה"ק צו אידיש' },
        { key: 'extract_hebrew', label: 'ארויסנעמען עברית' },
        { key: 'english_to_yiddish', label: 'ענגליש צו אידיש' },
        { key: 'english_to_hebrew', label: 'ענגליש צו לשון הקודש' },
        { key: 'other_languages', label: 'אנדערע שפראכן' }
    ];

    const writingFields = [
        { key: 'chassidic_style', label: 'סגנון חסידי' },
        { key: 'learning_style', label: 'סגנון לומדות' },
        { key: 'halacha_style', label: 'סגנון הלכה' },
        { key: 'mussar_style', label: 'סגנון מוסר' },
        { key: 'stories_style', label: 'גליונות וסיפורים' },
        { key: 'introduction', label: 'מבוא והקדמה' },
        { key: 'biography', label: 'תולדות' }
    ];

    const proofreadingFields = [
        { key: 'typing_errors', label: 'טעויות הקלדה' },
        { key: 'punctuation', label: 'פיסוק והגה' },
        { key: 'final_proofing', label: 'הגה אחרון' }
    ];

    const editingFields = [
        { key: 'content_organization', label: 'סידור הענינים' },
        { key: 'references', label: 'מראי מקומות' },
        { key: 'general', label: 'כללי' },
        { key: 'titles', label: 'כותרות' },
        { key: 'language_improvement', label: 'שיפור הלשון' },
        { key: 'explanations', label: 'ביאורים' },
        { key: 'content_review', label: 'ביקור התוכן' }
    ];

    const otherWorkFields = [
        { key: 'source_index', label: 'מפתחות מקורות' },
        { key: 'subject_index', label: 'מפתחות הענינים' },
        { key: 'biographies', label: 'תולדות' },
        { key: 'collection_from_books', label: 'ליקוט מפי ספרים' }
    ];

    const graphicFields = [
        { key: 'page_layout', label: 'סידור הדפים' },
        { key: 'cover_design', label: 'שערים גרעפיק' },
        { key: 'illustrations', label: 'ציורים לתוך הספר' }
    ];

    const gemaraFields = [
        { key: 'gemara_general', label: 'גמרא לומדות' },
        { key: 'berachos', label: 'ברכות' },
        { key: 'shabbos', label: 'שבת' },
        { key: 'eruvin', label: 'עירובין' },
        { key: 'pesachim', label: 'פסחים' },
        { key: 'rosh_hashana', label: 'ר"ה' },
        { key: 'yoma', label: 'יומא' },
        { key: 'sukkah', label: 'סוכה' },
        { key: 'beitzah', label: 'ביצה' },
        { key: 'taanis', label: 'תענית' },
        { key: 'megillah', label: 'מגילה' },
        { key: 'moed_katan', label: 'מועד קטן' },
        { key: 'chagigah', label: 'חגיגה' },
        { key: 'yevamos', label: 'יבמות' },
        { key: 'kesubos', label: 'כתובות' },
        { key: 'nedarim', label: 'נדרים' },
        { key: 'nazir', label: 'נזיר' },
        { key: 'sotah', label: 'סוטה' },
        { key: 'gittin', label: 'גיטין' },
        { key: 'kiddushin', label: 'קידושין' },
        { key: 'bava_kamma', label: 'בבא קמא' },
        { key: 'bava_metzia', label: 'בבא מציעא' },
        { key: 'bava_basra', label: 'בבא בתרא' },
        { key: 'sanhedrin', label: 'סנהדרין' },
        { key: 'makkos', label: 'מכות' },
        { key: 'shevuos', label: 'שבועות' },
        { key: 'avodah_zarah', label: 'עבודה זרה' },
        { key: 'horayos', label: 'הוריות' },
        { key: 'zevachim', label: 'זבחים' },
        { key: 'menachos', label: 'מנחות' },
        { key: 'chullin', label: 'חולין' },
        { key: 'bechoros', label: 'בכורות' },
        { key: 'arachin', label: 'ערכין' },
        { key: 'temurah', label: 'תמורה' },
        { key: 'kerisos', label: 'כריתות' },
        { key: 'meilah', label: 'מעילה' },
        { key: 'niddah', label: 'נדה' }
    ];

    const torahFields = [
        { key: 'tanach', label: 'תנ"ך' },
        { key: 'drush_agada', label: 'דרוש ואגדה' },
        { key: 'maharal', label: 'מהר"ל מפראג' },
        { key: 'kabbalah', label: 'קבלה' },
        { key: 'ramchal', label: 'רמח"ל' },
        { key: 'mussar', label: 'מוסר' },
        { key: 'jewish_history', label: 'קורות עם ישראל' },
        { key: 'chassidus', label: 'ספרי חסידות' },
        { key: 'jewish_history_stories', label: 'תולדות עם ישראל' },
        { key: 'tzaddik_stories', label: 'סיפורי צדיקים' },
        { key: 'lineage', label: 'יחוס' },
        { key: 'yahrtzeits', label: 'יארצייטן' },
        { key: 'hashkafa', label: 'השקפה' },
        { key: 'kanaos', label: 'קנאות' }
    ];

    const halachaFields = [
        { key: 'shulchan_aruch_orach_chaim', label: 'שו"ע או"ח' },
        { key: 'shulchan_aruch_yoreh_deah', label: 'שו"ע יו"ד' },
        { key: 'shulchan_aruch_even_haezer', label: 'שו"ע אהע"ז' },
        { key: 'shulchan_aruch_choshen_mishpat', label: 'שו"ע חו"מ' }
    ];

    const softwareFields = [
        { key: 'word', label: 'ווארד (Word)' },
        { key: 'excel', label: 'עקסעל (Excel)' },
        { key: 'tag', label: 'תג (TAG)' },
        { key: 'indesign', label: 'אינדעזיין (InDesign)' },
        { key: 'otzar_hachochma', label: 'אוצר החכמה' },
        { key: 'otzaros_hatorah', label: 'אוצרות התורה' },
        { key: 'dbs', label: 'די בי עס (DBS)' },
        { key: 'bar_ilan', label: 'בר אילן' }
    ];

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">הערכה מפורטת - Detailed Assessment</CardTitle>
                    <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                        Save
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="personal" className="w-full">
                    <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-6">
                        <TabsTrigger value="personal">חלק א</TabsTrigger>
                        <TabsTrigger value="experience">חלק ב</TabsTrigger>
                        <TabsTrigger value="typing">חלק ג</TabsTrigger>
                        <TabsTrigger value="expertise">חלק ד</TabsTrigger>
                        <TabsTrigger value="software">חלק ה</TabsTrigger>
                        <TabsTrigger value="all">All</TabsTrigger>
                    </TabsList>

                    <TabsContent value="personal" className="space-y-4">
                        <h3 className="font-semibold text-slate-700">פרטים איבער אייך - Personal Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-slate-600">באשעפטוגונג - Occupation</label>
                                <Input value={formData.occupation} onChange={(e) => setFormData({ ...formData, occupation: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-sm text-slate-600">אדרעס - Address</label>
                                <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-sm text-slate-600">שפראך - Languages</label>
                                <Input value={formData.languages} onChange={(e) => setFormData({ ...formData, languages: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-sm text-slate-600">קהילה / חסידות - Community</label>
                                <Input value={formData.community} onChange={(e) => setFormData({ ...formData, community: e.target.value })} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm text-slate-600">נאך פרטים - Other Details</label>
                                <Input value={formData.other_details} onChange={(e) => setFormData({ ...formData, other_details: e.target.value })} />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="experience" className="space-y-4">
                        <h3 className="font-semibold text-slate-700">עקספיריענס - Experience</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm text-slate-600">כמה שנים עריכה - Years Editing</label>
                                <Input type="text" value={formData.years_editing} onChange={(e) => setFormData({ ...formData, years_editing: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-sm text-slate-600">עבד אצל מכונים - Institutions</label>
                                <Input value={formData.institutions} onChange={(e) => setFormData({ ...formData, institutions: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-sm text-slate-600">ספרים ערך - Books Edited</label>
                                <Input value={formData.books_edited} onChange={(e) => setFormData({ ...formData, books_edited: e.target.value })} />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="typing" className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-700">טייפונג - Typing (0-100 or n/e)</h3>
                            <SectionInputs data={formData.typing_skills} onChange={(val) => setFormData({ ...formData, typing_skills: val })} fields={typingFields} />
                        </div>

                        <div className="space-y-4 pt-6 border-t">
                            <h3 className="font-semibold text-slate-700">כתיבה - לשון הקודש - Writing Hebrew</h3>
                            <SectionInputs data={formData.writing_hebrew} onChange={(val) => setFormData({ ...formData, writing_hebrew: val })} fields={writingFields} />
                        </div>

                        <div className="space-y-4 pt-6 border-t">
                            <h3 className="font-semibold text-slate-700">הגה - לשון הקודש - Proofreading Hebrew</h3>
                            <SectionInputs data={formData.proofreading_hebrew} onChange={(val) => setFormData({ ...formData, proofreading_hebrew: val })} fields={proofreadingFields} />
                        </div>

                        <div className="space-y-4 pt-6 border-t">
                            <h3 className="font-semibold text-slate-700">עריכה - לשון הקודש - Editing Hebrew</h3>
                            <SectionInputs data={formData.editing_hebrew} onChange={(val) => setFormData({ ...formData, editing_hebrew: val })} fields={editingFields} />
                        </div>

                        <div className="space-y-4 pt-6 border-t">
                            <h3 className="font-semibold text-slate-700">כתיבה - אידיש - Writing Yiddish</h3>
                            <SectionInputs data={formData.writing_yiddish} onChange={(val) => setFormData({ ...formData, writing_yiddish: val })} fields={writingFields} />
                        </div>

                        <div className="space-y-4 pt-6 border-t">
                            <h3 className="font-semibold text-slate-700">הגה - אידיש - Proofreading Yiddish</h3>
                            <SectionInputs data={formData.proofreading_yiddish} onChange={(val) => setFormData({ ...formData, proofreading_yiddish: val })} fields={proofreadingFields} />
                        </div>

                        <div className="space-y-4 pt-6 border-t">
                            <h3 className="font-semibold text-slate-700">עריכה - אידיש - Editing Yiddish</h3>
                            <SectionInputs data={formData.editing_yiddish} onChange={(val) => setFormData({ ...formData, editing_yiddish: val })} fields={editingFields} />
                        </div>

                        <div className="space-y-4 pt-6 border-t">
                            <h3 className="font-semibold text-slate-700">שאר עבודות - Other Work</h3>
                            <SectionInputs data={formData.other_work} onChange={(val) => setFormData({ ...formData, other_work: val })} fields={otherWorkFields} />
                        </div>

                        <div className="space-y-4 pt-6 border-t">
                            <h3 className="font-semibold text-slate-700">עימוד גרעפיק - Graphic Layout</h3>
                            <SectionInputs data={formData.graphic_layout} onChange={(val) => setFormData({ ...formData, graphic_layout: val })} fields={graphicFields} />
                        </div>
                    </TabsContent>

                    <TabsContent value="expertise" className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-700">תורה ומוסר - Torah & Mussar (0-100 or n/e)</h3>
                            <SectionInputs data={formData.subject_expertise} onChange={(val) => setFormData({ ...formData, subject_expertise: val })} fields={torahFields} />
                        </div>

                        <div className="space-y-4 pt-6 border-t">
                            <h3 className="font-semibold text-slate-700">גמרא - Gemara</h3>
                            <SectionInputs data={formData.subject_expertise} onChange={(val) => setFormData({ ...formData, subject_expertise: val })} fields={gemaraFields} />
                        </div>

                        <div className="space-y-4 pt-6 border-t">
                            <h3 className="font-semibold text-slate-700">שולחן ערוך - Shulchan Aruch</h3>
                            <SectionInputs data={formData.subject_expertise} onChange={(val) => setFormData({ ...formData, subject_expertise: val })} fields={halachaFields} />
                        </div>
                    </TabsContent>

                    <TabsContent value="software" className="space-y-4">
                        <h3 className="font-semibold text-slate-700">סאפטווער און טעכנעלאגיע - Software & Technology (0-100 or n/e)</h3>
                        <SectionInputs data={formData.software_skills} onChange={(val) => setFormData({ ...formData, software_skills: val })} fields={softwareFields} />
                    </TabsContent>

                    <TabsContent value="all">
                        <div className="text-center text-slate-500 py-8">
                            Use the tabs above to navigate through all sections
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
