import BIOMETRIC from "../models/biometricModel.js";
import Validator from "validatorjs";
import reply from '../common/reply.js';


export default {

    //Biometric create
    async createBiometric(req, res) {
        try {
            let request = req.body;
            let exist = await BIOMETRIC.findOne({ "user_id": request.user_id });
            if (exist) {
                return res.status(403).send({ message: 'This user biometric is already exist.' });
            }
            let biometric = await BIOMETRIC.create(request);
            return res.status(201).send({ biometric: biometric, message: "Biometric created successfully." });
        } catch (err) {
            return res.status(500).send({ message: "Internal Server Error" })
        }
    },

    async getBiometricListForDevice(req, res) {
        try {
            console.log(req.params);
            const biometrics = await BIOMETRIC.find()
                .skip(+(req.params.skip ?? '0'))
                .limit(+(req.params.limit ?? '10'));
            return res.status(200).json(biometrics);
        } catch (err) {
            return res.status(500).send({ message: "Internal Server Error" })
        }
    },


    // Get Biometrics List
    async getBiometricList(req, res) {
        try {
            const biometrics = await BIOMETRIC.find();
            return res.status(200).json(biometrics);
        } catch (err) {
            return res.status(500).send({ message: "Internal Server Error" })
        }
    },


    // Delete Biometric
    async deleteBiometric(req, res) {
        try {
            let id = req.body.id;
            const biometric = await BIOMETRIC.findByIdAndRemove(id);
            if (!biometric) {
                return res.status(404).send({ message: "Biometric not found." })
            }
            return res.status(200).send({ id: id, message: "Biometric deleted successfully." })
        } catch (err) {
            return res.status(500).send({ message: "Internal Server Error" })
        }
    },

    // Update Biometric
    async updateBiometric(req, res) {
        try {
            let request = req.body
            if (!request) {
                return res.send("All input is required!");
            }
            let _id = req.body.id;
            const biometric = await BIOMETRIC.findById(_id);
            if (!biometric) {
                return res.status(404).send({ message: "Biometric not found" });
            }
            await BIOMETRIC.findByIdAndUpdate(_id, request);
            return res.status(201).send({ message: "Biometric updated successfully" });
        } catch (err) {
            return res.status(500).send({ message: "Internal Server Error" });
        }
    },

    // Get Biometric By Id
    async getBiometricById(req, res) {
        try {
            const biometric = await BIOMETRIC.findById(req.body.id);
            return res.status(200).json(biometric);
        } catch (err) {
            return res.status(500).send({ message: "Internal Server Error" })
        }
    }


}