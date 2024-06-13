export default function (token: string | null) {
    if (!token) {
        console.error('No customer access token cookie, are you logged in?')
    }

    return token
}
