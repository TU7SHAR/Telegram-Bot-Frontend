import InviteTracking from "../../components/InviteTracking";

export default function InvitesPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-black tracking-tight">
          Invite Management
        </h1>
        <p className="text-zinc-500 mt-2">
          Monitor and manage all Telegram bot access tokens.
        </p>
      </div>

      <InviteTracking />
    </div>
  );
}
