const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.balrayautos.co.za";
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${siteUrl}/reset-password`,
});