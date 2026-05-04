import { t } from 'elysia'
import { createRouter } from '~/common/ioc/elysia-base'
import { betterAuthPlugin } from '~/auth-plugin'
import { CompleteProfileUseCase } from '../application/usecases/complete-profile.usecase'
import { GetMyPatientUseCase } from '../application/usecases/get-my-patient.usecase'
import { ListInsurancesUseCase } from '../application/usecases/list-insurances.usecase'
import { CreateInsuranceUseCase } from '../application/usecases/create-insurance.usecase'
import { UpdateInsuranceUseCase } from '../application/usecases/update-insurance.usecase'
import { DeleteInsuranceUseCase } from '../application/usecases/delete-insurance.usecase'
import { CompleteProfileInputSchema } from '../application/dtos/inputs/complete-profile.input'
import { CreateInsuranceInputSchema, UpdateInsuranceInputSchema } from '../application/dtos/inputs/insurance.input'
import { PatientOutputSchema, PaginatedPatientsOutputSchema } from '../application/dtos/outputs/patient.output'
import { InsuranceOutputSchema } from '../application/dtos/outputs/insurance.output'
import { ListPatientsUseCase } from '../application/usecases/list-patients.usecase'
import { RegisterPatientUseCase } from '../application/usecases/register-patient.usecase'
import { RegisterPatientInputSchema } from '../application/dtos/inputs/register-patient.input'
import { GetPatientProfileUseCase } from '../application/usecases/get-patient-profile.usecase'

export const patientsRoutes = createRouter({ prefix: '/patients' })
  .get(
    '/insurances',
    ({ container }) => container.get(ListInsurancesUseCase).execute(),
    { response: t.Array(InsuranceOutputSchema) },
  )
  .use(betterAuthPlugin)
  .post(
    '/insurances',
    ({ container, body }) => container.get(CreateInsuranceUseCase).execute(body),
    {
      body:     CreateInsuranceInputSchema,
      response: InsuranceOutputSchema,
      roles:    ['doctor', 'receptionist'],
      status:   201,
    },
  )
  .patch(
    '/insurances/:id',
    ({ container, params, body }) =>
      container.get(UpdateInsuranceUseCase).execute({ id: params.id, ...body }),
    {
      body:     UpdateInsuranceInputSchema,
      response: InsuranceOutputSchema,
      roles:    ['doctor', 'receptionist'],
    },
  )
  .delete(
    '/insurances/:id',
    ({ container, params }) =>
      container.get(DeleteInsuranceUseCase).execute({ id: params.id }),
    { roles: ['doctor', 'receptionist'] },
  )
  .get(
    '/',
    ({ container, query }) =>
      container.get(ListPatientsUseCase).execute({
        page:     Math.max(1, Number(query.page)     || 1),
        pageSize: Math.min(100, Math.max(1, Number(query.pageSize) || 10)),
        search:   query.search,
      }),
    {
      query:    t.Object({ page: t.Optional(t.String()), pageSize: t.Optional(t.String()), search: t.Optional(t.String()) }),
      response: PaginatedPatientsOutputSchema,
      auth:     true,
    },
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
  .get(
    '/profile',
    ({ container, query }) => container.get(GetPatientProfileUseCase).execute(query.dui),
    {
      roles: ['doctor', 'receptionist'],
      query: t.Object({ dui: t.String() }),
    },
  )
  .post(
    '/register',
    ({ container, body }) =>
      container.get(RegisterPatientUseCase).execute(body),
    {
      body:     RegisterPatientInputSchema,
      response: PatientOutputSchema,
      roles:    ['receptionist', 'doctor'],
      status:   201,
    },
  )
