import Exam from "../models/examModel.js"


export default {

    //College Category create
    async createExam(req, res) {
        let request = req.body;
        request.image = req?.file == undefined ? null : req?.file?.filename != undefined && req?.file?.filename;
        let exist = await Exam.findOne({ "name": request.name });
        if (exist) {
            return res.status(200).send({ message: 'This exam is already exists!' });
        }
        try {
            let exam = await Exam.create(request);
            return res.status(200).send({ status_code: 200, exam: exam, message: "Exam created successfully." });
        } catch (err) {
            return res.status(400).send({ message: "Something Went Wrong!" })
        }
    },


    // Get Colleges Category
    async getExams(req, res) {
        try {
            let exam = await Exam.find();
            return res.status(200).json(exam);
        } catch (err) {
            console.log(err, "error");
            return res.status(400).send({ message: "Unable to fetch exam datails!" })
        }
    },

    async getExamsByEligibility(req, res) {
        try {
            let exams = await Exam.find({elg_class:req?.params?.elg_class});
            return res.status(200).json(exams);
        } catch (err) {
            console.log(err, "error");
            return res.status(400).send({ message: "Unable to fetch exam datails!" })
        }
    },


    // Update College
    async updateCategory(req, res) {
        try {
            let request = req.body;
            if (req?.files['image'][0]?.filename && req?.files['logo'] == undefined) {
                request.image = 'images/' + req?.files['image'][0]?.filename;
            }
            if (req?.files['logo'][0]?.filename && req?.files['image'] == undefined) {
                request.logo = 'images/' + req?.files['logo'][0]?.filename;
            }
            if (req?.files['image'][0]?.filename && req?.files['logo'][0]?.filename) {
                request.image = 'images/' + req?.files['image'][0]?.filename;
                request.logo = 'images/' + req?.files['logo'][0]?.filename;
            }
            if (!request) {
                return res.status(400).send({ message: "All Input Field Is Required" });
            }
            let _id = req.body.id;
            const category = await Category.findById(_id);
            if (!category) {
                return res.status(404).send({ message: "Category Not Found !!" })
            }
            console.log(request, "request");
            await Category.findByIdAndUpdate(_id, request)
            return res.status(200).send({ status_code: 200, category: request, message: "Category updated successfully." })

        } catch (err) {
            console.log(err);
            return res.status(400).send(err)
        }

    },


    // Delete College:
    async deleteExam(req, res) {
        try {
            let id = req.query.id;
            const news = await Exam.findByIdAndRemove(id);
            if (!news) {
                return res.status(404).send({ message: "Exam not found" })
            }
            return res.status(200).send({ status_code: 200, id: id, message: "Exam deleted successfully." })
        } catch (err) {
            console.log(err);
            return res.status(400).send(err)
        }
    },

    // Update User
    async updateExam(req, res) {
        try {
            let request = req.body;
            const image = req?.file?.filename;
            if (!request) {
                return res.json(reply.failed("All input is required"));
            }
            const examMain = await Exam.findById({ _id: req.body.id });
            if (!examMain) {
                return res.json(reply.failed("Exam not found!!"))
            }
            console.log(req.body,"test5");
            var exam = await Exam.findOneAndUpdate(
                { _id: req.body.id },
                {
                    $set: {
                        image: image,
                        name: req.body.name,
                        description: req.body.description,
                        elg_class: req.body.elg_class,
                        elg_dob: req.body.elg_dob,
                        admission_process: req.body.admission_process,
                        language: req.body.language,
                        examSeats: req.body.examSeats,
                        date_exam: req.body.date_exam,
                        shortName: req.body.shortName
                    },
                }
            );
            if (exam) {
                return res.status(200).send({ status_code: 200, "exam": exam, message: "Exam updated successfully." });
            }
            return res.status(200).send({ status_code: 200, users: request, message: "Exam updated successfully." });
        } catch (err) {
            console.log(err);
            return res.status(400).send(err)
        }
    },
    // Soft Delete College:
    async softDeleteCategory(req, res) {
        try {
            let id = req.body.id;
            const category = await Category.findById(id);
            if (!category) {
                return res.status(404).send({ message: "Category not found" });
            }
            const categoryName = category.name;
            const categories = await Category.find({});
            const filterCategoryParent = [];
            categories.map((cat) => {
                if (cat.name == categoryName) {
                    filterCategoryParent.push(cat.id);
                }
                cat?.branch.map((item) => {
                    if (item == categoryName) {
                        filterCategoryParent.push(cat.id);
                    }
                });
            });
            await Category.update(
                { _id: { $in: filterCategoryParent } },
                { $set: { softDelete: true } },
                { multi: true }
            );
            return res.status(200).send({ status_code: 200, id: id, message: "Category deleted successfully." })
        } catch (err) {
            console.log(err);
            return res.status(400).send(err)
        }
    },


    // Soft Delete College:
    async restoreCategory(req, res) {
        try {
            let id = req.body.id;
            await Category.update(
                { _id: id },
                { $set: { softDelete: false } },
                { multi: true }
            );
            return res.status(200).send({ status_code: 200, id: id, message: "Category restore successfully." })
        } catch (err) {
            console.log(err);
            return res.status(400).send(err)
        }

    }


}