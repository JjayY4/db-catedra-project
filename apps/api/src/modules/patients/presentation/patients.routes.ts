import { t } from 'elysia'
import { createRouter } from '~/common/ioc/elysia-base'
import { betterAuthPlugin } from '~/auth-plugin'
import { CompleteProfileUseCase } from '../application/usecases/complete-profile.usecase'
import { GetMyPatientUseCase } from '../application/usecases/get-my-patient.usecase'
import { ListInsurancesUseCase } from '../application/usecases/list-insurances.usecase'
import { CompleteProfileInputSchema } from '../application/dtos/inputs/complete-profile.input'
import { PatientOutputSchema } from '../application/dtos/outputs/patient.output'
import { InsuranceOutputSchema } from '../application/dtos/outputs/insurance.output'
import { ListPatientsUseCase } from '../application/usecases/list-patients.usecase'

export const patientsRoutes = createRouter({ prefix: '/patients' })
  .get(
    '/insurances',
    ({ container }) => container.get(ListInsurancesUseCase).execute(),
    { response: t.Array(InsuranceOutputSchema) },
  )
  .use(betterAuthPlugin)
  .get(
    '/',
    ({ container }) => container.get(ListPatientsUseCase).execute(),
    { 
      response: t.Array(PatientOutputSchema), 
      auth: true 
    }
  )
  .get(
    '/me',
    ({ container, user }) => container.get(GetMyPatientUseCase).execute({ userId: user.id }),
    { response: t.Nullable(PatientOutputSchema), auth: true },
  )
  .post(
    '/complete-profile',
    ({ container, user, body }) =>
      container.get(CompleteProfileUseCase).execute({ ...body, userId: user.id }),
    {
      body:     CompleteProfileInputSchema,
      response: PatientOutputSchema,
      auth:     true,
    },
  )
