import nodemailer from "nodemailer";

function getTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

export async function sendReviewReminder(to: string, dueCount: number) {
  const reviewUrl = `${process.env.APP_URL}/review`;

  await getTransporter().sendMail({
    from: `"记词" <${process.env.GMAIL_USER}>`,
    to,
    subject: `今天有 ${dueCount} 个词等你复习`,
    text: `你有 ${dueCount} 个到期的单词/词组/句子待复习。\n\n去复习：${reviewUrl}`,
    html: `<p>你有 <strong>${dueCount}</strong> 个到期的单词/词组/句子待复习。</p><p><a href="${reviewUrl}">点这里去复习</a></p>`,
  });
}
