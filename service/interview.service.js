const { startOfDay, endOfDay, add, previousMonday, nextSunday, subWeeks, addWeeks, startOfMonth, endOfMonth, subMonths, addMonths, parseISO } = require('date-fns');
const StaffService = require("./staff.service");
const AgentService = require("./agent.service");
const StudentService = require("./student.service");
const Interview = require("../models/Interview")

const staffService = new StaffService();
const studentService = new StudentService();
const agentService = new AgentService();


class InterviewService {
  constructor() {
  }

  async createInterview(id, data) {
    const staff = await staffService.findById(id);
    const agent = await agentService.findById(staff.agentId);
    const staffIds = [id];
    if (agent.accountManager) staffIds.push(agent.accountManager);
    const studentIds = [];
    if (data.studentId) {
      studentIds.push(data.studentId);
    }
    const interview = await Interview.create({
      ...data,
      creatorId: id,
      creatorType: "AGENT",
      staffIds: staffIds,
      studentIds,
    });
    return { id: interview._id };
  }

  async getPartnerUpcomingInterviews(id, query) {
    let filter;
    filter = { staffIds: { $in: id } };

    if (query.type) {
      filter = {
        ...filter,
        type: query.type,
      };
    }

    if (query.time) {
      const startOfToday = startOfDay(new Date());
      const endOfToday = endOfDay(new Date());
      let dateFilter;
      switch (query.time) {
        case "TODAY": {
          dateFilter = {
            $or: [{ startTime: { $gte: startOfToday } }, { endTime: { $gte: startOfToday } }],
          };
          break;
        }
        case "TOMORROW": {
          const startOfTomorrow = add(startOfToday, { days: 1 });
          const endOfTomorrow = add(startOfToday, { days: 1 });
          dateFilter = {
            $or: [
              { startTime: { $gte: startOfTomorrow, $lte: endOfTomorrow } },
              { endTime: { $gte: startOfTomorrow, $lte: endOfTomorrow } },
            ],
          };
          break;
        }
        case "THIS_WEEK": {
          const startOfWeek = previousMonday(startOfToday);
          const endOfWeek = nextSunday(endOfToday);
          dateFilter = {
            $or: [
              { startTime: { $gte: startOfWeek, $lte: endOfWeek } },
              { endTime: { $gte: startOfWeek, $lte: endOfWeek } },
            ],
          };
          break;
        }
        case "PREVIOUS_WEEK": {
          const startOfWeek = subWeeks(previousMonday(startOfToday), 1);
          const endOfWeek = subWeeks(nextSunday(endOfToday), 1);
          dateFilter = {
            $or: [
              { startTime: { $gte: startOfWeek, $lte: endOfWeek } },
              { endTime: { $gte: startOfWeek, $lte: endOfWeek } },
            ],
          };
          break;
        }
        case "UPCOMING_WEEK": {
          const startOfWeek = addWeeks(previousMonday(startOfToday), 1);
          const endOfWeek = addWeeks(nextSunday(endOfToday), 1);
          dateFilter = {
            $or: [
              { startTime: { $gte: startOfWeek, $lte: endOfWeek } },
              { endTime: { $gte: startOfWeek, $lte: endOfWeek } },
            ],
          };
          break;
        }
        case "THIS_MONTH": {
          const startTime = startOfMonth(startOfToday);
          const endTime = endOfMonth(endOfToday);
          dateFilter = {
            $or: [{ startTime: { $gte: startTime, $lte: endTime } }, { endTime: { $gte: startTime, $lte: endTime } }],
          };
          break;
        }
        case "PREVIOUS_MONTH": {
          const startTime = subMonths(startOfMonth(startOfToday), 1);
          const endTime = subMonths(endOfMonth(endOfToday), 1);
          dateFilter = {
            $or: [{ startTime: { $gte: startTime, $lte: endTime } }, { endTime: { $gte: startTime, $lte: endTime } }],
          };
          break;
        }
        case "UPCOMING_MONTH": {
          const startTime = addMonths(startOfMonth(startOfToday), 1);
          const endTime = addMonths(endOfMonth(endOfToday), 1);
          dateFilter = {
            $or: [{ startTime: { $gte: startTime, $lte: endTime } }, { endTime: { $gte: startTime, $lte: endTime } }],
          };
          break;
        }
      }
      filter = { ...filter, ...dateFilter };
    } else if (query.startTime && query.endTime) {
      const startOfToday = startOfDay(parseISO(query.startTime.toString()));
      const endOfToday = endOfDay(parseISO(query.endTime.toString()));
      filter = {
        ...filter,
        $or: [
          { startTime: { $gte: startOfToday, $lte: endOfToday } },
          { endTime: { $gte: startOfToday, $lte: endOfToday } },
        ],
      };
    } else {
      filter = {
        ...filter
      };
    }
    return this.mapInterviews(await Interview.find(filter).sort({ startTime: 1 }));
  }

  async mapInterviews(interviews) {
    return Promise.all(
      interviews.map(async (interview) => {
        const creatorModel = await staffService.findById(interview.creatorId);
        let organizer;
        if (creatorModel) {
          organizer = {
            name: creatorModel.fullName,
            email: creatorModel.email,
            phone: creatorModel.phone,
            dp: creatorModel.dp,
            isOrganizer: true,
          };
        }

        const participants = [];
        if (interview.staffIds.length > 0) {
          for (let i = 0; i < interview.staffIds.length; i++) {
            const participant = await staffService.findById(interview.staffIds[i]);
            if (participant) {
              participants.push({
                name: participant.fullName,
                email: participant.email,
                phone: participant.phone,
                dp: participant.dp,
                isOrganizer: participant.id === interview.creatorId,
              });
            }
          }
        }

        let studentId = null;
        if (interview.studentIds.length > 0) {
          studentId = interview.studentIds[0];
          for (let i = 0; i < interview.studentIds.length; i++) {
            const participant = await studentService.findById(interview.studentIds[i]);
            if (participant) {
              const name = participant.studentInformation.firstName + " " + participant.studentInformation.lastName;
              participants.push({
                name,
                email: participant.studentInformation.email,
                phone: participant.studentInformation.mobile,
                dp: participant.studentInformation.dp,
                isOrganizer: participant.id === interview.creatorId,
              });
            }
          }
        }

        return {
          id: interview.id,
          title: interview.title,
          description: interview.description,
          creatorType: interview.creatorType,
          reason: interview.reason,
          startTime: interview.startTime,
          endTime: interview.endTime,
          organizer,
          participants,
          tool: interview.tool,
          link: interview.link,
          type: interview.type,
          applicationId: interview.applicationId,
          studentId,
        };
      })
    );
  }
}

module.exports = InterviewService;
