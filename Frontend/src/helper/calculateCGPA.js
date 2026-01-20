export const calculateCGPA = (courses = []) => {
  let totalCredits = 0;
  let totalPoints = 0;

  courses.forEach(c => {
    const credit = Number(c.creditHour);
    const grade = Number(c.gradePoint);

    if (!isNaN(credit) && !isNaN(grade)) {
      totalCredits += credit;
      totalPoints += credit * grade;
    }
  });

  if (totalCredits === 0) return null;

  return Number((totalPoints / totalCredits).toFixed(2));
};
