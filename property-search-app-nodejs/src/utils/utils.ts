// Source - https://stackoverflow.com/a/13735363
// Posted by Benjamin Atkin, modified by community. See post 'Timeline' for change history
// Retrieved 2026-02-25, License - CC BY-SA 3.0

export function pbcopy(data: string) {
    var proc = require('child_process').spawn('clip');
    proc.stdin.write(data); proc.stdin.end();
}
