import moment from "moment";
import Lecture from "../models/lectureModel.js";
import StudentAttendence from "../models/studentAttendenceModel.js";
import Student from "../models/studentModel.js";

/**
 * Returns an array of numbers parsed from the input string.
 * @param {string} input
 * @returns {number[]}
 */
export function parseNumberRanges(input) {
    const result = [];

    // Split the input by commas (with optional spaces)
    const parts = input.split(/\s*,\s*/);

    for (const part of parts) {
        // Check if the part contains a range (dash-separated)
        if (part.includes('-')) {
            // Split by dash (with optional spaces)
            const rangeParts = part.split(/\s*-\s*/);

            if (rangeParts.length === 2) {
                try {
                    const start = parseInt(rangeParts[0].trim(), 10);
                    const end = parseInt(rangeParts[1].trim(), 10);

                    // Add all numbers in the range to the result
                    if (!isNaN(start) && !isNaN(end)) {
                        for (let i = start; i <= end; i++) {
                            result.push(i);
                        }
                    }
                } catch (error) {
                    // Ignore parsing errors
                }
            }
        } else {
            // Handle individual numbers
            try {
                const number = parseInt(part.trim(), 10);
                if (!isNaN(number)) {
                    result.push(number);
                }
            } catch (error) {
                // Ignore parsing errors
            }
        }
    }

    return result;
};

export default {
    async processDayLectures(req, res) {
        const date = req.query.date ?? moment().format('YYYY-MM-DD');
        const lectures = await Lecture.find({
            start_time: { $regex: `^${date}` }
        });
        const recordsToCreate = [];
        await Promise.all(lectures.map(async lecture => {
            const students = await Student.find({
                semester_id: lecture.semester_id,
            });
            const rollNumbers = lecture.roll_no
                ? parseNumberRanges(lecture.roll_no)
                : students.map(s => s.roll_no);
            const attendances = await StudentAttendence.find({
                lecture_uid: lecture.uid
            });
            rollNumbers.forEach(rollNumber => {
                if (!attendances.find(a => a.roll_no == rollNumber)) {
                    const student = students.find(s => s.roll_no === rollNumber);

                    // @Todo: Check if leave is marked for this student
                    const leaveMarked = false;

                    student && recordsToCreate.push({
                        type: lecture.type,
                        lecture_uid: lecture.uid,
                        student_id: student._id,
                        roll_no: rollNumber,
                        course_id: lecture.course_id,
                        subject_id: lecture.subject_id,
                        semester_id: lecture.semester_id,
                        attendance_status: leaveMarked ? 'Leave' : 'Absent',
                        a_date: date + ' ' + moment().format('HH:mm:ss'),
                        machine_id: 'CRON',
                    });
                }
            });
            Lecture.updateOne({ uid: lecture.uid }, { $set: { is_done: true } });
        }));
        if (recordsToCreate.length > 0) {
            await StudentAttendence.insertMany(recordsToCreate);
        }
        return res.status(200).send({
            error: false,
            result: `[${date}]: ${lectures.length} lecture(s) were processed and ${recordsToCreate.length} record(s) of student attendance were created.`,
        });
    }
};