export default function (token: string | undefined) {
    if (!token) throw new Error('No checkout cookie')

    return token
}
