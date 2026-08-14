import { useLocalSearchParams } from "expo-router";
import AdminGamePlatforms from "../../../../src/components/admin/games/platforms/AdminGamePlatforms";
export default function GamePlatforms() { const { gameId } = useLocalSearchParams<{ gameId?: string }>(); return <AdminGamePlatforms gameId={Array.isArray(gameId) ? gameId[0] : gameId} />; }
