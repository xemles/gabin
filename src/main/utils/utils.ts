import { join } from 'path'

export class expoAttempt {
    private max: number
    timeout: NodeJS.Timeout = setTimeout(()=>{ return })
    attempts: number
 
    constructor(max?: number) {
        this.attempts = 0;
        this.max = max? max : 12
    }

    getTimeout(): number {
        return Math.round(Math.exp(this.attempts/2))*1000
    }

    incrementAttempts(): void {
        this.attempts = this.attempts === this.max? this.attempts : this.attempts+1
    }

    getAttempts(): number {
        return this.attempts
    }

    resetAttempts(): void {
        this.attempts = 0;
    }

    getHumanTimeout(): string {
        let timeout = ''

        const date = new Date(this.getTimeout());

        if (date.getUTCHours()) timeout += `${date.getUTCHours()} hour(s) `
        if (date.getUTCMinutes()) timeout += `${date.getUTCMinutes()} minute(s) `
        if (date.getUTCSeconds()) timeout += `${date.getUTCSeconds()} second(s) `

        return timeout
    }

    reconnectAfterError(callback: ()=>void): void {
        this.incrementAttempts()
        this.timeout = setTimeout(() => {
            callback()
        }, this.getTimeout())
    }

    reset() {
        this.resetAttempts()
        clearTimeout(this.timeout)
    }

    humanTimeout(): string {
        return this.getHumanTimeout()
    }

    stop() {
        clearTimeout(this.timeout)
        this.attempts = -1
    }
}

export function deepCopy(a: any): any {
    let outObject: any
    let value
    let key

    // Return the value if a is not an object
    if (typeof a !== 'object' || a === null) {
        return a 
    }
    
    // Create an array or object to hold the values
    outObject = Array.isArray(a) ? [] : {}
    
    for (key in a) {
        value = a[key]

        // Recursively (deep) copy for nested objects, including arrays
        outObject[key] = deepCopy(value)
    }
    
    return outObject
}

export class holder {
    private held: string[] = []

    add(elem: string) {
        if (this.held.indexOf(elem) === -1) this.held.push(elem)
    }
    
    remove(elem: string) {
        this.held = this.held.filter(item => (item !== elem))        
    }
    
    isHeld(elem: string) {
        return (this.held.indexOf(elem) !== -1)
    }

    reset() {
        this.held = []
    }
}

export class timer {

    private id: any
    private remaining: number
    private started: Date = new Date()
    private running = false

    private callback: ()=>void

    constructor(callback: ()=>void, delay: number) {
        this.remaining = delay
        this.callback = callback

        this.start()
    }
    
    start() {
        this.running = true
        this.started = new Date()
        this.id = setTimeout(this.callback, this.remaining)
    }

    pause() {
        this.running = false
        clearTimeout(this.id)
        this.remaining -= new Date().getTime() - this.started.getTime()
    }

    getTimeLeft() {
        if (this.running) {
            this.pause()
            this.start()
        }

        return this.remaining
    }

    getStateRunning() {
            return this.running
    }

}

export function isDev(): boolean {
    return process.argv[0].includes('electron')
}

export function getPath(str: string): string {
    let strPath = join(__dirname, 'models/silero.onnx')
    if (!isDev()) strPath = strPath.replace('app.asar', 'app.asar.unpacked')

    return strPath
}
