

import mongoose from "mongoose"

const categorySchema = new mongoose.Schema({
    categoryName : { type: String, required: true}
})

const categoryName =mongoose.model('categoryName',categorySchema);

export default categoryName;