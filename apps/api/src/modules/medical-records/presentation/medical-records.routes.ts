import { createRouter } from '~/common/ioc/elysia-base'
import { betterAuthPlugin } from '~/auth-plugin'
import { GetMedicalHistoryUseCase } from '../application/usecases/get-medical-history.usecase'
import { CompleteConsultationUseCase } from '../application/usecases/complete-consultation.usecase'
import { GetAppointmentDetailUseCase } from '../application/usecases/get-appointment-detail.usecase'
import { GetMyAppointmentDetailUseCase } from '../application/usecases/get-my-appointment-detail.usecase'
import { UpdateMedicalRecordUseCase } from '../application/usecases/update-medical-record.usecase'
import { AppointmentDetailOutputSchema, PatientAppointmentDetailOutputSchema } from '../application/dtos/outputs/appointment-detail.output'
import { UpdateMedicalRecordInputSchema } from '../application/dtos/inputs/update-medical-record.input'
import { GetPatientHistoryByDuiUseCase } from '../application/usecases/get-patient-history-by-dui.usecase'
import { t } from 'elysia'

export const medicalRecordsRoutes = createRouter({ prefix: '/medical-records' })
  .use(betterAuthPlugin)
  .get(
    '/by-appointment/:appointmentId',
    async ({ container, params }) => {
      return container.get(GetAppointmentDetailUseCase).execute(params.appointmentId)
    },
    {
      roles:    ['doctor', 'receptionist'],
      params:   t.Object({ appointmentId: t.String() }),
      response: AppointmentDetailOutputSchema,
    },
  )
  .get(
    '/my-appointment/:appointmentId',
    async ({ container, params, user }) => {
      return container.get(GetMyAppointmentDetailUseCase).execute(user.id, params.appointmentId)
    },
    {
      roles:    ['patient'],
      params:   t.Object({ appointmentId: t.String() }),
      response: PatientAppointmentDetailOutputSchema,
    },
  )
  .get(
    '/:id/history',
    async ({ container, params }) => {
      const history = await container.get(GetMedicalHistoryUseCase).execute(params.id)
      return { success: true, data: history }
    },
    {
      roles: ['doctor', 'receptionist'],
      params: t.Object({ id: t.String() }),
    },
  )
  .post(
    '/:appointmentId/consultation',
    async ({ container, params, body, user, set }) => {
      const consultation = await container.get(CompleteConsultationUseCase).execute({
        appointmentId:       params.appointmentId,
        doctorId:            user.id,
        symptoms:            body.symptoms,
        bloodPressure:       body.bloodPressure,
        weight:              body.weight,
        mainDiagnosis:       body.mainDiagnosis,
        prescribedTreatment: body.prescribedTreatment,
        doctorPrivateNotes:  body.doctorPrivateNotes,
      })
      set.status = 201
      return { success: true, data: consultation }
    },
    {
      roles: ['doctor'],
      params: t.Object({ appointmentId: t.String() }),
      body: t.Object({
        symptoms:            t.Optional(t.String()),
        bloodPressure:       t.Optional(t.String()),
        weight:              t.Optional(t.Number()),
        mainDiagnosis:       t.String(),
        prescribedTreatment: t.Optional(t.String()),
        doctorPrivateNotes:  t.Optional(t.String()),
      }),
    },
  )
  .get(
    '/patient-history/:dui',
    async ({ container, params }) => container.get(GetPatientHistoryByDuiUseCase).execute(params.dui),
    {
      roles:  ['doctor', 'receptionist'],
      params: t.Object({ dui: t.String() }),
    },
  )
  .patch(
    '/:recordId/background',
    async ({ container, params, body, set }) => {
      await container.get(UpdateMedicalRecordUseCase).execute(params.recordId, body)
      set.status = 204
      return null
    },
    {
      roles:  ['doctor'],
      params: t.Object({ recordId: t.String() }),
      body:   UpdateMedicalRecordInputSchema,
    },
  )