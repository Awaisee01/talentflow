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

export default function AssessmentForm({ candidate, onUpdate }: AssessmentFormProps) {
    const [saving, setSaving] = useState(false);
    // Initialize form data with safe defaults (handling potential nulls)
    const [formData, setFormData] = useState({
        occupation: candidate.occupation || '',
        address: candidate.address || '',
        languages: candidate.languages || '',
        community: candidate.community || '',
        other_details: candidate.other_details || '',
        years_editing: candidate.years_editing || '',
        institutions: candidate.institutions || '',
        books_edited: candidate.books_edited || '',
        typing_skills: candidate.typing_skills || {},
        writing_hebrew: candidate.writing_hebrew || {},
        proofreading_hebrew: candidate.proofreading_hebrew || {},
        editing_hebrew: candidate.editing_hebrew || {},
        writing_yiddish: candidate.writing_yiddish || {},
        proofreading_yiddish: candidate.proofreading_yiddish || {},
        editing_yiddish: candidate.editing_yiddish || {},
        other_work: candidate.other_work || {},
        graphic_layout: candidate.graphic_layout || {},
        subject_expertise: candidate.subject_expertise || {},
        software_skills: candidate.software_skills || {}
    });

    const handleSave = async () => {
        setSaving(true);
        try {
            await base44.entities.Candidate.update(candidate._id || candidate.id, formData);
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
                                <Input type="number" value={formData.years_editing} onChange={(e) => setFormData({ ...formData, years_editing: e.target.value })} />
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
