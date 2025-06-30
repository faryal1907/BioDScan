import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IData extends Document {
    Date: Date;
    Time: string;
    'Bumble Bee': number;
    'Honey Bee': number;
    'Lady Bug': number;
    'Total Count': number;
    'Temperature (C)': number;
    'Humidity (%)': number;
}

const DataSchema: Schema<IData> = new mongoose.Schema(
    {
        Date: { type: Date, required: true },
        Time: { type: String, required: true },
        'Bumble Bee': { type: Number, required: true },
        'Honey Bee': { type: Number, required: true },
        'Lady Bug': { type: Number, required: true },
        'Total Count': { type: Number, required: true },
        'Temperature (C)': { type: Number, required: true },
        'Humidity (%)': { type: Number, required: true },
    },
    { timestamps: true },
);

// Prevent model overwrite issues in development
const Data: Model<IData> = mongoose.models.Data || mongoose.model<IData>('Data', DataSchema);
export default Data; 