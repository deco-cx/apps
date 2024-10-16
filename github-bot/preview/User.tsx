import { ProjectUser } from "../types.ts";

export default function UserPreview(user: ProjectUser) {
  return (
    <div
      style={{
        width: "100dvw",
        height: "100dvh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#282a2e",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "18px",
          margin: "24px",
          backgroundColor: "#313338",
          color: "#f2f3f5",
          borderRadius: "16px",
          padding: "12px",
        }}
      >
        <img
          src="https://ozksgdmyrqcxcwhnbepg.supabase.co/storage/v1/object/public/assets/5461/16ac85f3-ef65-4e6f-906e-b0b4de8fb115"
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "999999px",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            marginTop: "8px",
          }}
        >
          <p style={{ fontSize: "18px", fontWeight: 500 }}>
            {user.githubUsername}
          </p>
          <p>
            Discord ID: {user.discordId}
          </p>
        </div>
      </div>
    </div>
  );
}
