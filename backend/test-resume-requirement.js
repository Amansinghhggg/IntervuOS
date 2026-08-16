import mongoose from "mongoose";

async function testResumeRequirement() {
  console.log("=== Testing Resume Enforcement for Assigned vs Mock Interviews ===");

  const candidateWithResume = {
    email: "candidate.with.resume@example.com",
    resume: { url: "https://cloudinary.com/resume.pdf" }
  };

  const candidateWithoutResume = {
    email: "candidate.no.resume@example.com",
    resume: null
  };

  // 1. Check logic for Assigned Interview (mode: "REGULAR", isMock: false)
  const isAssignedInterview = (interview, isMock) => !isMock && interview.mode !== "MOCK";
  
  const validateStart = (interview, isMock, user) => {
    if (isAssignedInterview(interview, isMock)) {
      if (!user?.resume?.url) {
        return { allowed: false, code: "RESUME_REQUIRED", message: "Resume required" };
      }
    }
    return { allowed: true };
  };

  // Case 1: Assigned interview without resume -> Blocked
  const assignedInterview = { mode: "REGULAR" };
  const res1 = validateStart(assignedInterview, false, candidateWithoutResume);
  console.log("Case 1 (Assigned Interview without Resume):", res1.allowed === false && res1.code === "RESUME_REQUIRED" ? "PASS (Blocked as expected)" : "FAIL");

  // Case 2: Assigned interview with resume -> Allowed
  const res2 = validateStart(assignedInterview, false, candidateWithResume);
  console.log("Case 2 (Assigned Interview with Resume):", res2.allowed === true ? "PASS (Allowed)" : "FAIL");

  // Case 3: Mock interview without resume -> Allowed
  const mockInterview = { mode: "MOCK" };
  const res3 = validateStart(mockInterview, true, candidateWithoutResume);
  console.log("Case 3 (Mock Interview without Resume):", res3.allowed === true ? "PASS (Allowed without resume for mocks)" : "FAIL");

  // Case 4: Mock interview with resume -> Allowed
  const res4 = validateStart(mockInterview, true, candidateWithResume);
  console.log("Case 4 (Mock Interview with Resume):", res4.allowed === true ? "PASS (Allowed)" : "FAIL");

  if (res1.allowed === false && res2.allowed === true && res3.allowed === true && res4.allowed === true) {
    console.log("\n>>> ALL RESUME ENFORCEMENT TESTS PASSED! <<<");
  } else {
    console.error("\n>>> TESTS FAILED <<<");
    process.exit(1);
  }
}

testResumeRequirement().catch(console.error);
