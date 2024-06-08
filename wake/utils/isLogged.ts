import getCustomerAcessToken from './getCustomerAcessToken.ts'

export default function (req: Request): boolean {
    return !!getCustomerAcessToken(req)
}
