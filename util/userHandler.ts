export function isTeacher(email?:string)
{
    return (email?.endsWith("@harker.org") || email === "25aaravb@students.harker.org" || email === "aarushv@students.harker.org")
}
export function isStudent(email?:string)
{
    return email?.endsWith("@students.harker.org");
}