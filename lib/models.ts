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
    analysis?: any; // JSON object from AI

    created_date: Date;
    updated_date: Date;
}

const CandidateSchema = new Schema<ICandidate>({
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
    years_editing: { type: Number }, // converted to Number for sorting ideally, but form had string
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
    matched_jobs: { type: [String] }, // Job IDs or Titles?

    resume_text: { type: String },
    analysis: { type: Schema.Types.Mixed },

    created_date: { type: Date, default: Date.now, index: true },
    updated_date: { type: Date, default: Date.now },
});



export const Candidate: Model<ICandidate> = models.Candidate || mongoose.model<ICandidate>('Candidate', CandidateSchema);
