<?php

declare(strict_types=1);

namespace app\commands;

use app\components\Uuid;
use app\models\Property;
use app\models\User;
use app\models\VerificationCase;
use Yii;
use yii\console\Controller;
use yii\console\ExitCode;
use yii\db\Query;
use yii\helpers\Inflector;

/**
 * Demo data for the admin dashboard/queue/lists (docs/18). Idempotent: wipes
 * previous demo data (users @demo.valestate + their cascades) then reseeds.
 * Usage: php yii demo/seed
 */
class DemoController extends Controller
{
    private const REASONS = ['PHOTOS_MISMATCH', 'DOC_ILLEGIBLE', 'BAIT_PRICING', 'OWNER_UNREACHABLE'];

    /** [localitySlug, type, intent, title, price, area, beds, baths, furnishing, state, daysAgo, turnHrs] */
    private const SPECS = [
        ['thangmeiband', 'RESIDENTIAL', 'SALE', '3 BHK Apartment with Valley View', 8500000, 1450, 3, 3, 'SEMI', 'PUBLISHED', 20, 6],
        ['uripok', 'RESIDENTIAL', 'RENT', 'Furnished 2 BHK Flat', 18000, 980, 2, 2, 'FURNISHED', 'PUBLISHED', 18, 10],
        ['lamphel', 'RESIDENTIAL', 'SALE', 'Independent 4 BHK House', 15000000, 2600, 4, 4, 'UNFURNISHED', 'PUBLISHED', 25, 22],
        ['khurai', 'RESIDENTIAL', 'SALE', 'Ready-to-move 2 BHK', 5200000, 1050, 2, 2, 'SEMI', 'PUBLISHED', 12, 30],
        ['porompat', 'COMMERCIAL', 'RENT', 'Ground-floor Shop, Main Road', 35000, 750, 0, 0, 'UNFURNISHED', 'PUBLISHED', 9, 8],
        ['mantripukhri', 'RESIDENTIAL', 'RENT', 'Premium 3 BHK Duplex', 28000, 1700, 3, 3, 'FURNISHED', 'PUBLISHED', 6, 14],
        ['kwakeithel', 'RESIDENTIAL', 'RENT', 'Cozy 1 BHK near Market', 9500, 520, 1, 1, 'SEMI', 'PUBLISHED', 4, 5],
        ['thangmeiband', 'COMMERCIAL', 'RENT', 'Office Space, 12 Workstations', 45000, 1200, 0, 0, 'FURNISHED', 'PUBLISHED', 15, 26],
        ['canchipur', 'LAND', 'SALE', 'Residential Plot (4 Katha)', 6200000, 2880, 0, 0, 'UNFURNISHED', 'REJECTED', 8, null],
        ['uripok', 'RESIDENTIAL', 'SALE', 'Corner 2 BHK Flat', 4800000, 990, 2, 2, 'UNFURNISHED', 'REJECTED', 11, null],
        ['khurai', 'RESIDENTIAL', 'RENT', 'Bright 1 BHK, New Building', 11000, 610, 1, 1, 'SEMI', 'REJECTED', 5, null],
        ['lamphel', 'LAND', 'SALE', 'Commercial Plot on Tiddim Road', 22000000, 4320, 0, 0, 'UNFURNISHED', 'UNCLAIMED', 1, null],
        ['porompat', 'RESIDENTIAL', 'SALE', 'Spacious 3 BHK, East-facing', 7200000, 1400, 3, 2, 'SEMI', 'UNCLAIMED', 0, null],
        ['mantripukhri', 'RESIDENTIAL', 'RENT', 'Modern Studio Apartment', 13000, 480, 1, 1, 'FURNISHED', 'UNCLAIMED', 0, null],
        ['thangmeiband', 'RESIDENTIAL', 'RENT', '2 BHK with Balcony', 16000, 900, 2, 2, 'SEMI', 'IN_VERIFICATION', 2, null],
        ['kwakeithel', 'COMMERCIAL', 'SALE', 'Retail Showroom Space', 9800000, 1600, 0, 0, 'UNFURNISHED', 'IN_VERIFICATION', 3, null],
        ['khurai', 'RESIDENTIAL', 'SALE', '3 BHK Builder Floor', 6800000, 1300, 3, 3, 'SEMI', 'RE_VERIFICATION', 16, 12],
        ['uripok', 'RESIDENTIAL', 'RENT', '2 BHK Family Home', 20000, 1100, 2, 2, 'FURNISHED', 'INFO_REQUESTED', 3, null],
    ];

    public function actionSeed(): int
    {
        $db = Yii::$app->db;

        // wipe previous demo data (cascades to their properties/cases/listings/inquiries)
        $db->createCommand()->delete('users', ['like', 'email', '@demo.valestate'])->execute();
        $this->stdout("Cleared previous demo data.\n");

        $owners = $this->makeUsers('owner', 5, 'owner');
        $buyers = $this->makeUsers('buyer', 3, 'buyer');
        $verifierId = (new Query())->select('id')->from('users')->where(['email' => 'verifier@valestate.test'])->scalar() ?: null;

        $localityIds = [];
        foreach ((new Query())->select(['slug', 'id'])->from('localities')->all() as $l) {
            $localityIds[$l['slug']] = (int) $l['id'];
        }

        $now = time();
        $published = [];
        foreach (self::SPECS as $i => $s) {
            [$slug, $type, $intent, $title, $price, $area, $beds, $baths, $furn, $state, $daysAgo, $turn] = $s;
            $ownerId = $owners[$i % count($owners)];
            $createdAt = gmdate('Y-m-d H:i:s', $now - $daysAgo * 86400 - random_int(0, 43200));

            $propStatus = match ($state) {
                'PUBLISHED' => Property::PUBLISHED,
                'REJECTED' => Property::REJECTED,
                'UNCLAIMED' => Property::SUBMITTED,
                'IN_VERIFICATION' => Property::IN_VERIFICATION,
                'RE_VERIFICATION' => Property::RE_VERIFICATION,
                'INFO_REQUESTED' => Property::INFO_REQUESTED,
                default => Property::SUBMITTED,
            };
            $uuid = Uuid::v4();
            $db->createCommand()->insert('properties', [
                'uuid' => $uuid, 'owner_id' => $ownerId, 'property_type' => $type, 'intent' => $intent,
                'title' => $title, 'description' => 'Well-maintained property in a great locality. Verified by ValEstate.',
                'locality_id' => $localityIds[$slug] ?? null, 'address_line' => ucfirst($slug) . ' Leikai', 'pincode' => '79500' . ($i % 9 + 1),
                'price_minor' => $price, 'currency' => 'INR', 'deposit_minor' => $intent === 'RENT' ? $price * 3 : null,
                'area_value' => $area, 'area_unit' => 'sqft',
                'attributes_json' => json_encode($beds ? ['bedrooms' => $beds, 'bathrooms' => $baths, 'furnishing' => $furn] : []),
                'status' => $propStatus, 'availability' => 'AVAILABLE',
                'submitted_at' => $createdAt, 'created_at' => $createdAt, 'updated_at' => $createdAt,
            ])->execute();
            $propId = (int) $db->getLastInsertID();

            // one ownership doc + a couple media (metadata only; files not present)
            $db->createCommand()->insert('documents', ['property_id' => $propId, 'owner_id' => $ownerId, 'doc_type' => 'OWNERSHIP', 'storage_key' => 'demo/none', 'sensitivity' => 'RESTRICTED', 'uploaded_at' => $createdAt])->execute();
            $db->createCommand()->batchInsert('media_assets', ['property_id', 'kind', 'storage_key', 'status', 'created_at'], [
                [$propId, 'PHOTO', 'demo/1', 'READY', $createdAt], [$propId, 'PHOTO', 'demo/2', 'READY', $createdAt],
            ])->execute();

            // verification case
            $caseState = in_array($state, ['PUBLISHED', 'REJECTED'], true) ? VerificationCase::DECIDED
                : ($state === 'UNCLAIMED' ? VerificationCase::UNCLAIMED
                : ($state === 'INFO_REQUESTED' ? VerificationCase::INFO_REQUESTED : VerificationCase::CLAIMED));
            $claimedAt = $caseState === VerificationCase::UNCLAIMED ? null : gmdate('Y-m-d H:i:s', strtotime($createdAt) + random_int(3600, 21600));
            $decidedAt = null;
            $decision = null;
            $reason = null;
            if ($state === 'PUBLISHED') {
                $decision = 'APPROVED';
                $decidedAt = gmdate('Y-m-d H:i:s', strtotime($claimedAt) + (int) $turn * 3600);
            } elseif ($state === 'REJECTED') {
                $decision = 'REJECTED';
                $reason = self::REASONS[$i % count(self::REASONS)];
                $decidedAt = gmdate('Y-m-d H:i:s', strtotime($claimedAt) + random_int(4, 20) * 3600);
            }
            $slaDue = gmdate('Y-m-d H:i:s', strtotime($claimedAt ?? $createdAt) + 24 * 3600);
            $assigned = $caseState === VerificationCase::UNCLAIMED ? null : $verifierId;
            $db->createCommand()->insert('verification_cases', [
                'property_id' => $propId, 'owner_id' => $ownerId, 'state' => $caseState,
                'assigned_verifier_id' => $assigned, 'decision' => $decision, 'reason_code' => $reason,
                'claimed_at' => $claimedAt, 'decided_at' => $decidedAt, 'sla_due_at' => $slaDue, 'created_at' => $createdAt,
            ])->execute();
            $caseId = (int) $db->getLastInsertID();
            $this->seedChecklist($caseId, $type, $state, $reason);

            if ($state === 'PUBLISHED') {
                $listSlug = substr(Inflector::slug($title . ' ' . strtolower($type) . ' ' . strtolower($intent)), 0, 180) . '-' . substr($uuid, 0, 8);
                $db->createCommand()->insert('listings', [
                    'uuid' => Uuid::v4(), 'property_id' => $propId, 'slug' => $listSlug, 'canonical_url' => '/property/' . $listSlug,
                    'visibility' => 'PUBLIC', 'verified_at' => $decidedAt, 'verification_tier' => 'STANDARD',
                    'checks_performed_json' => json_encode(['documents', 'identity', 'owner_call']),
                    'published_at' => $decidedAt, 'created_at' => $decidedAt,
                ])->execute();
                $published[] = [$propId, (int) $db->getLastInsertID(), $ownerId];
            }
        }

        // inquiries on some published listings
        $inq = 0;
        foreach ($published as $k => [$propId, $listingId, $ownerId]) {
            if ($k % 2 !== 0) {
                continue;
            }
            $db->createCommand()->insert('inquiries', [
                'listing_id' => $listingId, 'buyer_id' => $buyers[$k % count($buyers)], 'owner_id' => $ownerId,
                'message' => 'Is this still available? I would like to schedule a visit.', 'status' => $k % 4 === 0 ? 'RESPONDED' : 'NEW',
                'created_at' => gmdate('Y-m-d H:i:s', $now - random_int(0, 7) * 86400),
            ])->execute();
            $inq++;
        }

        $this->stdout("Demo seeded: " . count(self::SPECS) . " properties, " . count($published) . " published, {$inq} inquiries.\n");
        return ExitCode::OK;
    }

    /** @return int[] user ids */
    private function makeUsers(string $prefix, int $n, string $role): array
    {
        $ids = [];
        $roleId = (new Query())->select('id')->from('roles')->where(['key' => $role])->scalar();
        for ($i = 1; $i <= $n; $i++) {
            $u = new User();
            $u->uuid = Uuid::v4();
            $u->name = ucfirst($prefix) . " Demo {$i}";
            $u->email = "{$prefix}{$i}@demo.valestate";
            $u->phone = '7' . str_pad((string) random_int(0, 999999999), 9, '0', STR_PAD_LEFT);
            $u->status = User::STATUS_ACTIVE;
            $u->setPassword('secret123');
            $u->save(false);
            if ($roleId) {
                Yii::$app->db->createCommand()->insert('user_roles', ['user_id' => $u->id, 'role_id' => $roleId])->execute();
            }
            $ids[] = (int) $u->id;
        }
        return $ids;
    }

    private function seedChecklist(int $caseId, string $type, string $state, ?string $reason): void
    {
        foreach (VerificationCase::checklistFor($type) as $key => $mandatory) {
            $result = match (true) {
                $state === 'PUBLISHED' => 'PASS',
                $state === 'REJECTED' => ($key === 'photos_match' || $key === 'ownership_doc_present' ? 'FAIL' : 'PASS'),
                $state === 'IN_VERIFICATION', $state === 'RE_VERIFICATION' => 'PASS',
                default => 'PENDING',
            };
            Yii::$app->db->createCommand()->insert('verification_checklist_items', [
                'case_id' => $caseId, 'item_key' => $key, 'mandatory' => $mandatory ? 1 : 0, 'result' => $result,
            ])->execute();
        }
    }
}
