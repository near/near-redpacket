export const howLongAgo = (ts) => {
    const howLong = (Date.now() - ts) / 1000
    if (howLong > 86400 * 2) return Math.floor(howLong / 86400) + ' days ago'
    else if (howLong > 86400) return Math.floor(howLong / 86400) + ' day ago'
    else if (howLong > 3600 * 2) return Math.floor(howLong / 3600) + ' hours ago'
    else if (howLong > 3600) return Math.floor(howLong / 3600) + ' hour ago'
    else if (howLong > 60 * 2) return Math.floor(howLong / 60) + ' minutes ago'
    else if (howLong > 60) return Math.floor(howLong / 60) + ' minute ago'
    else return Math.floor(howLong) + ' seconds ago'
}