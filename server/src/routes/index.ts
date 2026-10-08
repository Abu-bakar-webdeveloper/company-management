import { Router } from 'express'
import authRouter from '../features/auth/auth.routes.js'
import attendanceRouter from '../features/attendance/attendance.routes.js'
import companyRouter from '../features/companies/company.routes.js'
import expenseRouter from '../features/expenses/expense.routes.js'
import leaveRouter from '../features/leave/leave.routes.js'
import performanceRouter from '../features/performance/performance.routes.js'
import salaryRouter from '../features/salaries/salary.routes.js'
import clientRouter from '../features/clients/client.routes.js'
import projectRouter from '../features/projects/project.routes.js'
import reportRouter from '../features/reports/report.routes.js'
import roleRouter from '../features/roles/companyRole.routes.js'
import teamRouter from '../features/team/team.routes.js'
import taskRouter from '../features/tasks/task.routes.js'
import uploadsRouter from '../features/uploads/uploads.routes.js'
import userRouter from '../features/users/user.routes.js'
import notificationRouter, {
  activityRouter,
} from '../features/notifications/notification.routes.js'

const apiRouter = Router()

apiRouter.use('/auth', authRouter)
apiRouter.use('/attendance', attendanceRouter)
apiRouter.use('/companies', companyRouter)
apiRouter.use('/roles', roleRouter)
apiRouter.use('/team', teamRouter)
apiRouter.use('/projects', projectRouter)
apiRouter.use('/clients', clientRouter)
apiRouter.use('/leaves', leaveRouter)
apiRouter.use('/expenses', expenseRouter)
apiRouter.use('/performance', performanceRouter)
apiRouter.use('/salaries', salaryRouter)
apiRouter.use('/reports', reportRouter)
apiRouter.use('/tasks', taskRouter)
apiRouter.use('/uploads', uploadsRouter)
apiRouter.use('/users', userRouter)
apiRouter.use('/notifications', notificationRouter)
apiRouter.use('/activities', activityRouter)

export default apiRouter
