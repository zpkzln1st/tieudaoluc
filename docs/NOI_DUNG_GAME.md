# TIÊU DAO LỤC — NỘI DUNG GAME (Game Content Bible)

> Idle MMO huyền huyễn võ hiệp · **Phase 1 = clone IdleMMO trung thực** · naming Hán Việt + Tiếng Việt.
> File này = **toàn bộ nội dung game dạng chữ** để review. Số liệu lấy theo IdleMMO quan sát được; chỗ nào suy ra/điền tạm sẽ ghi *(tạm)*.
> Tùy biến (ngũ hành, môn phái, võ công mới...) = Phase 2, ghi ở cuối.

---

## A. TIỀN TỆ

| Loại | Tên game | Icon | Độ hiếm | Nguồn | Dùng mua |
|---|---|---|---|---|---|
| Gold | **Bạc** | 🟡 | Nhiều (triệu) | Cày mọi hoạt động | Liệu, đan bình, công cụ, phí dungeon/teleport, kinh tế cơ bản |
| Shards | **Hồn Thạch** | 🔴 | Vừa (vạn) | Combat / Yêu Vương / Bí Cảnh / Mùa / Chinh Phạt | Linh thạch + đan + pet **cao cấp** (sức mạnh) |
| Tokens | **Nguyên Bảo** | 🔷 | Hiếm (đơn vị) | Nạp tiền + Milestone Vạn Vật Phổ + Membership | Cosmetic, slot, đổi tên/môn phái |

**Quy đổi**: Nguyên Bảo → Bạc khi hiến Thần Đàn (vd 100 NB = 90,000 Bạc).
**Nguyên tắc vàng**: Nguyên Bảo (nạp) KHÔNG mua sức mạnh. Sức mạnh phải cày Hồn Thạch. Membership mua được bằng Bạc trên Chợ.

---

## B. CHỈ SỐ NHÂN VẬT

### B1. Tứ Trụ (4 chỉ số chính — level riêng, max 100 → Ascension)
| Tên | Gốc | Mô tả |
|---|---|---|
| **Lực Đạo** | Strength | Sức mạnh, sát thương vật lý nền |
| **Hộ Thể** | Defence | Thể phách, sinh lực + phòng ngự nền |
| **Thân Pháp** | Speed | Tốc độ di chuyển/đánh, né tránh |
| **Linh Xảo** | Dexterity | Chính xác, chí mạng, khéo léo |

### B2. Chỉ số phụ (dẫn xuất từ Tứ Trụ + trang bị + skill)
| Tên | Gốc | Mô tả |
|---|---|---|
| **Bạo Kích Suất** | Critical Chance | Tỉ lệ chí mạng (vd 25%) |
| **Bạo Kích Thương** | Critical Damage | Sát thương cộng thêm khi chí mạng (vd +320) |
| **Công Kích Lực** | Attack Power | Tổng công từ skill + trang bị (vd 883) |
| **Hộ Thể (Phòng Ngự)** | Protection | Tổng phòng (vd 852) |
| **Né Tránh** | Agility | Giảm tỉ lệ địch đánh trúng (vd 714) |
| **Mệnh Trúng** | Accuracy | Tỉ lệ mình đánh trúng (vd 667) |
| **Khinh Công** | Movement Speed | Tốc độ travel + săn (vd 32.56 m/s) |
| **Phụ Thương** | Damage | Sát thương cộng cuối mỗi đòn |
| **Cơ Duyên** | Magic Find | Tăng tỉ lệ rớt đồ hiếm |

### B3. Tài nguyên
- **Sinh Lực (HP)**: hồi bằng món ăn/thuốc. Combat dự đoán "End Status: còn X máu / chết".
- **Nội Lực (MP/Khí)**: Phase 2 (khi có võ công). Mọi võ công tốn Nội Lực.

### B4. Ascension — Cảnh Giới Đột Phá
- Max Lv 100 mỗi Tứ Trụ → vào **Ascension Level** (vd Combat Ascension Lv 97).
- **Đạo Điểm (Ascension Point)**: tự hồi ~1 điểm / 3h. Tiêu để "thắp" **Lĩnh Ngộ (Perk)** có thời hạn (mặc định 3h).
- Perk gate theo Ascension Level. Ví dụ ladder:
  - Lĩnh Ngộ EXP I (Lv 1–5, +5% EXP từng Tứ Trụ/Combat), giá 1 Đạo Điểm
  - II (Lv 7–25, +7%), III (Lv 65–140, +10%), IV (cao hơn)
  - Cơ Duyên Combat II (Lv 150, +8% Magic Find Bí Cảnh/Yêu Vương/Battle), giá 3 Đạo Điểm
- Cơ chế: thắp perk → start hành động → perk "chốt" cả phiên dù danh nghĩa 3h.

---

## C. 9 KỸ NĂNG KINH TẾ

> Cấu trúc trang skill (mọi skill): NPC mentor + thoại + "Đàm Đạo" · danh sách hành động · "Đồng Đạo Lân Cận" · "Tiến Độ Tu Luyện" (% + Ascension Perks) · Metrics (đã thu hoạch / tổng EXP / thời gian).
> Modal hành động: chip (Lv / thời gian / +EXP chính / +EXP Tứ Trụ) · slot **Linh Thạch** · **Nguyên liệu** (đỏ=thiếu/trắng=đủ) · Auto-mua · Quantity (1/Max) · Xem Vật Phẩm / Bắt Đầu.

### C1. Phạt Mộc (Đốn Củi) — +Lực Đạo
NPC: **Lão Trương Tiều Phu**. Thoại mẫu: *"Muốn thành đại tiều phu thì phải chịu mạo hiểm với rìu sắc."*
| Vật phẩm | Lv | +EXP Phạt Mộc | Thời gian | +Tứ Trụ |
|---|---|---|---|---|
| Tùng Mộc (Oak Log) | 1 | 4 | 11.4s | +1 Lực |
| Trúc Mộc (Yew Log) | 5 | 7 | 14.3s | +2 Lực |
| *(thêm: Bạch Dương/Birch, Đa/Banyan, Phong/Maple, Liễu/Willow, Hồng Mộc/Mahogany, Huyền Mộc/Mystical — gate Lv cao)* | | | | |

### C2. Thải Khoáng (Đào Khoáng) — +Lực Đạo +Hộ Thể
NPC: **Hắc Lão Khoáng Đầu**. Thoại: *"Bảo vật thật nằm sâu trong lòng đất. Đá và quặng, bằng hữu."*
| Vật phẩm | Lv | +EXP | Thời gian | +Tứ Trụ |
|---|---|---|---|---|
| Hắc Thán (Coal Ore) | 1 | 4 | 10.9s | +1 Lực +1 Hộ Thể |
| Tích Khoáng (Tin Ore) | 1 | 4 | 10.9s | +1 Lực +1 Hộ Thể |
| Thạch Khôi (Limestone) | 10 | 25 | 45.5s | +Lực |
| *(thêm: Đồng/Copper, Thiết/Iron, Diên/Lead, Cương/Steel, Thủy Ngân/Mercury, Lục Khoáng/Chromite, Urani, Huyền Tinh khoáng)* | | | | |

> **Than (Hắc Thán) = nhiên liệu xương sống**: cầu cao nhất game (Dã Luyện + Phanh Nhâm đều cần).

### C3. Điếu Ngư (Câu Cá) — +Linh Xảo (cần MỒI)
NPC: **Lão Phần Ngư Ông**. Thoại: *"Nhẫn nại, tiểu hữu. Bí quyết câu cá là nhẫn nại và chọn đúng chỗ."*
| Cá | Lv | +EXP | Thời gian | Mồi cần |
|---|---|---|---|---|
| Lư Ngư (Perch) | 11 | 9 | 16s | 1× Mồi Ám (Tarnished Bait) |
| Giải (Crab) | 40 | 19 | 27s | 1× Mồi Nguyên Tố (Elemental Bait) |
| Quy (Turtle) | 50 | 23 | 32s | 1× Mồi Cổ (Eldritch Bait) |
| Hồng Ngư (Stingray) | 60 | 30 | 40s | 1× Mồi Cổ |
| *(map 1:1 với Phanh Nhâm: Tuyết Ngư/Cod, Hồi/Salmon, Cá Ngừ/Tuna, Tôn/Trout, Trích/Herring, Sa Đinh/Sardines, Long Hà/Lobster, Đăng Lung Ngư/Lantern, Đại Bạch Giảo/Great White Shark)* | | | | |

### C4. Luyện Đan (Luyện Dược) — +Thân Pháp — **CRAFT linh thạch + đan**
NPC: **Lý Dược Vương** (nữ). Thoại: *"Hoan nghênh đến đan phòng. Coi chừng khói độc — đừng chạm thứ phát sáng."*
Sản phẩm 2 loại: **Đan dược (buff combat)** + **Linh Thạch (buff gather skill)**.
| Sản phẩm | Lv | +EXP | Thời gian | Nguyên liệu | Tác dụng |
|---|---|---|---|---|---|
| Chiến Đấu Đan (Battle Potion) | 1 | 29 | 136.4s | 2× Lucky Rabbit Foot + 1× Đan Bình Thô | +Battle EXP, +Hunt Efficiency (có thời hạn) |
| Tiều Phu Linh Thạch | 2 | 34 | 136.4s | 6× Goblin Totem + 1× Linh Thạch Thô | +10% Phạt Mộc EXP, +2% Eff |
| Khoáng Phu Linh Thạch | 3 | 39 | 136.4s | 2× Ducks Mouth + 1× Linh Thạch Thô | +Thải Khoáng EXP/Eff |
| Ngư Phu Linh Thạch | 4 | 44 | 136.4s | 1× Boar Tusk + 1× Linh Thạch Thô | +Điếu Ngư |
| Dã Luyện Linh Thạch | 5 | 49 | 136.4s | 3× Goblin Pouch + 1× Linh Thạch Thô | +Dã Luyện |
| Trù Sư Linh Thạch | 6 | 57 | 136.4s | 2× Goblin Scraps + 1× Linh Thạch Thô | +Phanh Nhâm |
| Phá Trận Đan (Dungeon Potion) | 10 | 150 | 318.2s | 1× Goblin Crown + 1× Đan Bình Thô | buff Bí Cảnh |
| Toái Thạch Linh Thạch (Rocksplitter) | 12 | 168 | 318.2s | 5× Cursed Talisman + 1× Linh Thạch Ám | +15% Thải Khoáng EXP, +4% Eff |
| Tinh Luyện Linh Thạch (Tampering) | 62 | 2048 | 1090.9s | 30× Snakes Head + 25× Golem Core Fragment + 1× Linh Thạch Cổ | +55% Dã Luyện EXP, +16% Eff |
| *(còn nhiều: Deepsea/Bastion/Falcon's Grace/Herculean/Hammerfell/Flavorburst/Riverbend Essence... Lv 13–62)* | | | | | |

> **Linh Thạch (Essence Crystal)**: buff per-skill, mỗi skill 1 family riêng, consume 1 khi refresh hành động (per-session). 2 buff: EXP% + Efficiency%. Top-tier (Divine/Titans/Mjolnir's...) mua bằng Hồn Thạch ở Phường Thị.

### C5. Dã Luyện (Luyện Quặng) — +Thân Pháp — **REFINE quặng → đĩnh**
NPC: **Âu Dã Tử / Thiết Tâm**. Thoại: *"Cảm nhận hơi nóng chứ? Lò rèn đang hát."*
Công thức chung: **1× Quặng + 1× Hắc Thán → 1× Đĩnh**.
| Đĩnh (Bar) | Lv | +EXP | Thời gian | Liệu |
|---|---|---|---|---|
| Tích Đĩnh (Tin Bar) | 1 | 2 | 10.9s | 1× Tích Khoáng + 1× Than |
| Đồng Đĩnh (Copper) | 5 | 3 | 13.6s | 1× Đồng + Than |
| Thiết Đĩnh (Iron) | 10 | 7 | 20.9s | 1× Thiết + Than |
| Diên Đĩnh (Lead) | 15 | 10 | 24.5s | 1× Diên + Than |
| Cương Đĩnh (Steel) | 25 | 14 | 28.2s | 1× Cương + Than |
| Thủy Ngân Đĩnh (Mercury) | 40 | 18 | 32.7s | 1× Thủy Ngân + Than |
| Lục Khoáng Đĩnh (Chromite) | 60 | 23 | 36.4s | 1× Lục Khoáng + Than |
| Urani Đĩnh (Uranium) | 70 | 26 | 40s | 1× Urani + Than |
| Huyền Tinh Đĩnh (Mystic Bar) | 90 | 36 | 50s | 1× Huyền Tinh + Than |

### C6. Phanh Nhâm (Nấu Ăn) — +Linh Xảo — **REFINE cá → món**
NPC: **Lữ Đại Trù**. Thoại: *"Hoan nghênh đến gian bếp của ta. Ở đây ta nấu ăn rất nghiêm túc."*
Công thức chung: **1× Cá sống + 1× Hắc Thán → 1× Món**. Món ăn dùng hồi máu/buff combat.
| Món | Lv | +EXP | Thời gian |
|---|---|---|---|
| Khảo Tuyết Ngư (Cooked Cod) | 1 | 1 | 7.3s |
| Khảo Hồi Ngư (Salmon) | 3 | 3 | 10.9s |
| Khảo Cá Ngừ (Tuna) | 5 | 4 | 12.7s |
| Khảo Tôn Ngư (Trout) | 8 | 5 | 15.5s |
| Khảo Lư Ngư (Perch) | 11 | 7 | 17.3s |
| Khảo Trích Ngư (Herring) | 15 | 8 | 20s |
| Khảo Sa Đinh (Sardines) | 25 | 10 | 22.7s |
| Khảo Long Hà (Lobster) | 30 | 12 | 25.5s |
| Khảo Giải (Crab) | 40 | 14 | 27.3s |
| Khảo Quy (Turtle) | 50 | 18 | 31.8s |
| Khảo Hồng Ngư (Stingray) | 60 | 23 | 36.4s |
| Khảo Đăng Lung Ngư (Lantern Fish) | 80 | 26 | 38.2s |
| Khảo Đại Bạch Giảo (Great White Shark) | 90 | 36 | 50s |

### C7. Đả Tạo (Rèn Đúc) — +Lực Đạo — **CRAFT trang bị + công cụ**
NPC: **Đại Tượng Sư Cương** (Master Blacksmith). Thoại: *"Ngươi đến học rèn? Tốt. Thiên hạ luôn cần thợ rèn giỏi hơn."*
- Filter loại: Kiếm / Đao / Cung / Phụ Khí / Mũ / Giáp / Găng / Xà Cạp / Giày / **Rìu / Cuốc / Cần Câu** (rèn cả công cụ!).
- Toggle "Có Thể Rèn" (chỉ hiện đồ đủ liệu + có **Đồ Phổ**).
- **Cần Đồ Phổ (Recipe)**: mua ở Chợ / rớt từ Bí Cảnh. Có đủ liệu mà không có Đồ Phổ = không rèn được.
- Ví dụ đồ endgame: **Thần Cung "Thần Tính" (Divinity)** Lv 90 — cần 10,000× Huyền Tinh Đĩnh + 1× Đan → +450 Công Kích, +100 Né, +100 Mệnh Trúng, +7 Bạo Suất, +200 Bạo Thương, +20% Hunt Eff.
- Grid hiện số lượng đã sở hữu mỗi món. Stat có "chấm xanh" = stat đặc biệt từ Đồ Phổ/phẩm chất.

### C8. Tọa Quan (Thiền Định) — vị tha, KHÔNG +Tứ Trụ
- Thiền: 0.8 EXP/s thụ động. **Lv 35** mở viết **Truyền Công Phù** (0.1 EXP/s khi viết, 60 phút/quyển, cần **Không Bạch Phù**).
- Phù **tặng người khác** (không tự dùng / alt). Người dùng được buff tức thì 2h. Sức phù scale theo Lv Tọa Quan (1%→15%, đường cong mũ 3.5).
- 2 loại: **(a) Khai Trí** = +EXP (skill/combat/hunting/guild); **(b) Tích Phúc** = +Magic Find (battle/dungeon/world boss).
- **Lv 100 = Vũ Hóa**: hiệu ứng hào quang lơ lửng trên profile (cosmetic vinh dự).
- Class trade-locked (Cursed/Banished) không viết được.

### C9. Doanh Tạo (Xây Dựng) — +Lực Đạo — material + Động Phủ
| Material | Lv | +EXP | Thời gian | Liệu |
|---|---|---|---|---|
| Đất Sét (Clay) | 1 | 12 | 38.2s | — |
| Cát (Sand) | 1 | 12 | 38.2s | — |
| Ván Yếu (Weak Plank) | 1 | 17 | 45.8s | 3× Tùng Mộc |
| Thiết Khấu (Iron Fitting) | 10 | 58 | 87.8s | 3× Thiết Đĩnh |
| Gạch (Brick) | 10 | 58 | 87.8s | 3× Đất Sét |
| Xà Yếu (Weak Beam) | 15 | 86 | 103.1s | 3× Bạch Dương + 3× Đa Mộc |
| Kính (Glass) | 15 | 86 | 103.1s | 3× Cát + 3× Thạch Khôi |
| Ván Chắc (Robust Plank) | 30 | 121 | 118.3s | 3× Đa Mộc |
| Xà Chắc (Robust Beam) | 45 | 173 | 145s | 3× Phong + 3× Liễu |
| Ván Mạnh (Strong Plank) | 65 | 219 | 160.3s | 3× Liễu |
| Xà Mạnh (Strong Beam) | 75 | 259 | 183.2s | 3× Hồng Mộc + 3× Huyền Mộc |

> Doanh Tạo nặng về gỗ (kim loại chỉ dùng Thiết Khấu). Thạch Khôi lấy từ Thải Khoáng. Phải có Động Phủ (hoặc làm guest) mới gather material được.

---

## D. CHUỖI CUNG ỨNG (Economy Graph)

```
Thải Khoáng ─quặng→ Dã Luyện ─đĩnh→ Đả Tạo ──→ Trang bị + Công cụ (rìu/cuốc/cần câu)
   └─Than ──────────┴──→ Phanh Nhâm                  ↑ Đồ Phổ (Bí Cảnh / Chợ)   │
Phạt Mộc ─gỗ→ Doanh Tạo (Động Phủ) ; gỗ→ Đả Tạo                            tool quay lại gather nhanh hơn
Điếu Ngư ─cá→ Phanh Nhâm ──→ Món ăn (hồi máu/buff combat)
Luyện Đan ←(liệu + combat drop)→ Linh Thạch (buff gather) + Đan (buff combat)
Tọa Quan → Truyền Công Phù (tặng người)
Doanh Tạo → Động Phủ → +Idle time mọi skill
Combat/Bí Cảnh/Yêu Vương → drop liệu + Đồ Phổ + Trứng Pet + Hồn Thạch
```

---

## E. COMBAT (clone IMMO — predictive)

### E1. Chiến Đấu / Đi Săn (solo grind)
- Chọn quái từ **Địch Nhân Lân Cận** (mỗi quái: số còn lại). Widget chạy như mọi activity.
- **Suy Tính Chiến Cục** (tính sẵn trước khi đánh):
  - Tổng địch · Số địch sẽ hạ · EXP/địch · EXP/s · Tổng EXP · Tổng thời gian · Thời gian/địch
  - Tab "Ta": Sát thương/đòn, Mệnh trúng %, Số đòn hạ địch, **Kết Cục: Sống sót còn X máu / Chết**
  - Tab "Địch": Sát thương/đòn, Mệnh trúng %
- **Bộ Pháp (Stance)**: Quân Hành (cân bằng) / Cuồng Công (Lực) / Kiên Thủ (Hộ Thể) / Tấn Tốc (Thân) / Linh Xảo (Linh Xảo). Đổi stat nhấn mạnh + stat nhận EXP.
- Quái **scale theo sức**: "Cấp 133 (điều chỉnh từ 20)". **Triệt Thoái** = bỏ chạy (mất phần thưởng).
- Quái mẫu (theo ảnh): Slimeball, Ogre, Spectre, Vulpina, Emberwhisp, Zephyrix, Nutmeg, Ollo, Florien... *(đặt tên Hán-Việt sau)*

### E2. Bí Cảnh (Dungeon) — nguồn Đồ Phổ
- 3 tab: **Thông Tin** (Lv, thời gian/run vd 3h, location, phí, +Magic Find) · **Bảo Vật Bảng** (loot table % chính xác từng món) · **Bắt Đầu** (Bộ Pháp, số Runs, breakdown EXP, % máu tốn, phí nhập = Bạc + Hồn Thạch).
- **Phân Tích Hiểm Cảnh**: Chiến Lực ta vs Độ Khó → vượt ngưỡng = +Cơ Duyên.
- Hoàn thành 100% + đếm Tổng Số Nhập Cảnh (vd 359). Bí cảnh đặc biệt có cap (vd "14/50 Runs").
- Ticker **Giang Hồ Kỳ Ngộ**: drop hiếm toàn server (recipe...).
- Bí cảnh mẫu: The Nexus (Lv95, 3h, phí 45,000 Bạc + 300 Hồn Thạch, +23% Magic Find, Legendary 1.25%/Mythic 0.645%), Cursed Asylum, Zenith's Sanctum, Frostbite Spire, Mirage Citadel, Volcanic Depths... *(Hán-Việt sau)*

### E3. Yêu Vương (World Boss) — nguồn Trứng Pet, sự kiện nhóm
- Spawn theo giờ server (đếm ngược 1h26m–11h27m...). **Gia Nhập Vây Sát** (lobby mở 2h trước). Location-locked.
- Loot table % minh bạch. Drop **Yêu Thú Đản (egg)** + liệu. Boss cấp cao = EXP + trứng hiếm hơn.
- Boss mẫu: Shadowmire (Lv30, Crystal Caverns, 1500 EXP), Thal'guth (Lv95, The Citadel, 12000 EXP), Voragor, Nethrax... Trứng mẫu: Solarix/Leovar/Scalethorn/Starmane/Sauronix/Zephyrix Egg.

### E4. 4 skill chiến đấu (mastery riêng, mỗi cái ladder Ascension)
Chiến Đấu (Combat) · Liệp Sát Tinh Thông (Hunting Mastery) · Thám Hiểm Bí Cảnh (Dungeoneering) · Ngự Thú (Pet Mastery).

---

## F. LINH THÚ (Pet)

- **4 trạng thái**: Chờ Lệnh / Xuất Chiến / Săn Mồi / Dưỡng Sức.
- **Equip 1 con** → cộng toàn bộ stat pet vào nhân vật (Attack/Protection/Agility/Accuracy/Move Speed/HP/Stamina). Pet mẫu: Blooplord (Lv62 — Agility 25, Accuracy 25, Protection 20, Attack 37, Move 5.72, Crit 4/16).
- **Thể Lực (Stamina)**: giới hạn cốt lõi, **chỉ hồi bằng Dưỡng Sức** (không mua tức thì) → xoay vòng nhiều pet.
  - Drain theo phẩm chất (Battle): Phàm 0.0065/s … Thần 0.0025/s. Nhân hệ số độ khó (0.75×–2.5×).
- **Ngự Thú (Pet Mastery)** mở: số pet song song (2→10), loot chance (2.5%→10%), stat scaling (0→20% từ Lv44), tốc hồi.
- **Hóa Hình (Evolution)** 5 lần: +5%/lần (→25%), reset Lv1 giữ bonus. **Ấp Trứng**. Phẩm chất Phàm→Thần.
- **Linh Thú Các (Exchange)**: chợ pet P2P (min price scale theo Lv/evolution tới 5×, tax 15%/12%, 20 listing, auto-delist 90 ngày).
- Multi-select batch (Battle/Hunt/Sleep/Feed). Location-locked (triệu hồi = 1/10 phí teleport).
- **Pet Mastery boost**: Lv44=1% … Lv100=20%.

---

## G. TRANG BỊ & VẬT PHẨM

### G1. Slot (clone IMMO paper-doll, 2 hàng)
- **Hàng Combat**: Mũ · Giáp · Quần (Xà Cạp) · Găng · Giày · **Vũ Khí (Main)** · **Phụ Khí (Off-hand)**
- **Hàng Công Cụ**: Cần Câu · Cuốc · Rìu · **Bội Sức** (cape/special — cosmetic/buff)
- **Phụ Khí động theo vũ khí**: kiếm 1 tay → khiên/ám khí; song đao → đao 2 (force); thương/côn/cung 2 tay → disable.
- Tool slot riêng → không phải bỏ vũ khí để chặt cây. Slot trống hiện "+" + tên gợi ý.
- *(Phase 2 có thể đổi sang VLTK 10 chính + 5 phụ.)*

### G2. Hai trục độc lập
- **Phẩm Chất (Quality)** × **Bậc (Tier nâng cấp)**. Vd "Tier 16/16, Quality Legendary".

**Phẩm Chất 7 bậc**:
| Gốc | Tên | Màu |
|---|---|---|
| Standard | Phàm Phẩm | Trắng |
| Refined | Lương Phẩm | Xanh dương |
| Premium | Tinh Phẩm | Xanh lá |
| Epic | Tuyệt Phẩm | Đỏ |
| Legendary | Truyền Thế | Vàng |
| Mythic | Thần Phẩm | Cam |
| Unique | Cô Bản | Tím |

### G3. Detail trang bị
Icon + tên + **stat chip** (vd +33 Mệnh Trúng, +72 Hộ Thể) + lore flavor + Type/Tier/Quality/Value + nút Tháo (Unequip)/Soi (Inspect). Có yêu cầu Lv tối thiểu để mặc (tách khỏi Tier).

### G4. Inventory — 3 tab
- **Hành Lý / Trang Bị / Tàng Bảo Các (Bank)** — cùng layout grid + detail panel.
- Sort 6 cách: Ngày / Phẩm Chất / Số Lượng / Loại / Giá Trị / Tên (+ nút đảo asc/desc).
- Background ô = màu phẩm chất. Số top-left = stack, bottom-right = Tier. ⭐ = favorite/khóa.
- Bank "không có gần đây": xem được, **không rút được** (phải tới thành thị). Nút "+" mở rộng slot (Nguyên Bảo).

### G5. Thang nguyên liệu / xúc tác 6 bậc (Cheap→Arcane)
**Thô → Ám → Quang → Nguyên Tố → Cổ → Huyền**. Áp cho:
- **Mồi câu**: Mồi Thô (2 Bạc) · Ám (4) · Quang (7) · Nguyên Tố (12) · Cổ (16) · Huyền (25)
- **Đan Bình / Linh Thạch (xúc tác Luyện Đan)**: Bình/Thạch Thô (5) · Ám (10) · Quang (50) · Nguyên Tố · Cổ · Huyền

---

## H. KINH TẾ — MUA BÁN

### H1. Phường Thị (Merchant — NPC, giá cố định)
Mỗi NPC 1 chuyên mục, có thoại riêng:
| Shop | NPC | Bán | Tiền |
|---|---|---|---|
| Y Quán | Ella | Dung Mạo (Skins) | Nguyên Bảo |
| Cảnh Đồ Phố | Elfina | Bối Cảnh | Nguyên Bảo |
| Càn Khôn Phố | Feron | **Slot** (Char 500 / Inv 200 / Pet 250 / Bank 150 NB) | Nguyên Bảo |
| Bách Hóa | Melriel | Liệu (mồi/xúc tác/tool/Blank Scroll) | **Bạc** |
| Bang Huy Phố | Ankhotep | Bang Huy (Guild Icons, 250–350 NB) | Nguyên Bảo |
| Thiên Giao Các | Sapphire | Pet + đồ cao cấp | **Hồn Thạch** |
| Di Bảo Lâu | Lilith Vane | Skins/BG/Pet (event mùa) | **Hồn Thạch** |

Đồ Hồn Thạch tiêu biểu (Thiên Giao Các): Linh Thạch đỉnh (Divine/Titans/Mjolnir's Essence 1,500), Đan thượng (Potion of the Gods 2,500), Pet hiếm (Orthrus/Lunark 300,000). Nhiều món tag **(Không Giao Dịch / Untradable)** = account-bound.
Bách Hóa (Bạc): Mồi Thô 2 → Huyền 25 · Đan Bình/Linh Thạch xúc tác · Công Cụ Sơ Cấp (Cần/Cuốc/Rìu 10) · **Không Bạch Phù 60,000** · Thoát Thai Đan (đổi class, 500 NB) · Cải Danh Phù (đổi tên, 500 NB).

### H2. Giao Dịch Hành (Market — P2P, order-book 2 chiều)
- **Rao Bán (Listings)**: hiện khoảng giá (vd 165–9.99K). **Thu Mua (Purchase Orders)**: đăng buy-order (vd Coal Ore 262.79K cái, giá 1–4 Bạc).
- Filter: Loại / Phẩm Chất (7 bậc) / Min-Max Tier / Min-Max Giá.
- Tax bán: 15% (member 12%). Bán cả **Hội Viên Lệnh** (30 Days Membership ~214K Bạc) → F2P mua membership bằng Bạc.

### H3. Thượng Cổ Thần Đàn (Shrine — GOLD SINK cộng đồng)
- Cả server hiến **Bạc / Nguyên Bảo** → mở buff TOÀN SERVER theo tier (hiệu lực 2h):
  - Tier 1 (~565K Bạc): +10% Primary Skill EXP, +10% Pet Mastery EXP, +5% Combat EXP
  - Tier 2 (~670K): +15% Skill, +15% Pet Mastery, +10% Bartering, +10% Combat, +5% Magic Find (Combat/Dungeon), +5% Hunt Eff/EXP
  - Tier 3 (~3.35M): +20% Skill/Pet, +15% Bartering/Combat, +10% Magic Find, +10% Hunt Eff, +15% Hunt EXP
- Top/Recent contributors (vd MasterNiles 22 triệu Bạc). → chống lạm phát + co-op.

### H4. Thượng Khách (Membership)
**$6.99 / 30 ngày** (subscription HOẶC item mua bằng Bạc trên Chợ). So sánh Free → Member:
| Mục | Free | Member |
|---|---|---|
| Idle time Main / Alt | 6h / 3h | 8h / 4h |
| Daily Magic Find | 5% | 10% |
| Token bonus | — | 200 sign-up + 100/tháng |
| EXP / Efficiency | — | +15% / +10% |
| Động Phủ decay | 60 ngày | 90 ngày |
| Power Hunt CD | 12h | 10h |
| Campaign Tasks | 5 | 7 |
| Pet/Inv/House/Friend slot | 14/35/10/25 | 21/42/16/50 |
| Pet Groups | 5 | 10 |
| Market/Trade Tax | 15%/13% | 12%/10% |
| Max Listing/Order | 10/10 | 25/25 |
| Purchase Order time | 48h | 14 ngày |
| Mailbox discount | — | 30% |
| Gradient Name + Badge 🔥 | — | ✓ |
| Profile Badges / Bio / Showcase | 1/1000/5 | 3/2500/10 |
- **Không pay-to-win**: chỉ tốc độ + tiện nghi + cosmetic, cap chung, mua được bằng Bạc.

---

## I. XÃ HỘI & CẠNH TRANH

### I1. Phi Cáp Đài (Communication Hub)
- 2 tab: **Tin Giang Hồ** (Notifications, filter Tất cả/Skills/Trade/Pet/Guild/Khác, inline reward, green-dot unread) + **Phi Cáp** (Messages, Received/Sent, limit 14/50, tốn phí gửi, Report/Delete).

### I2. Bằng Hữu (Friends)
- 3 tab: Bạn / Đã Nhận / Đã Gửi. Slot 25 (member 50). Status: **Đang Tu Luyện (Idling)** / **Vắng Mặt (Offline)**. 3-dot menu mỗi bạn.

### I3. Tổ Đội (Party) + Tỷ Thí Đại Hội (Leagues)
- Party size 4. Leagues: đua skill theo đội, time-limited, **gối nhau liên tục** (12 active + 12 upcoming).
- Cột: Môn Tỷ Thí / Cách Tính Điểm (Experience hoặc Kills cho Battle) / Giới Hạn Đội (4) / Ngày / Trạng Thái (Sắp/Đang/Đã Qua) / Số Người.
- 2 biến thể mỗi skill: ✓ thường / ⚠️ dành class Cursed.

### I4. Bang Phái (Guild)
- 4 section: Home / Browse / **Mùa (Season)** / **Chinh Phạt (Conquest)**. Cap 25 member.
- **Guild Level** (max 100) + **Guild Mastery** riêng. Marks (Công Tích), Season Position.
- Actions: Công Thành (Raid) · Tổng Đàn (Guild Hall) · Bang Khố (Stockpile) · Thử Thách (Challenges) · Thông Báo · Binh Khí Khố (Armoury) · Tụ Linh Trì (Energizing Pool) · Tập Kích (Assault) · Nhật Ký · Rời Bang.
- Browse: filter Min/Max Level & Member + "chỉ hiện tà bang (banished)".

### I5. Quần Hùng Tranh Bá (Conquest) — phủ GvG lên world map
- Mỗi location = **zone tranh đoạt**. Trạng thái: **Thống Trị (Dominated)** / **Tranh Chấp (Contested)** + "X Active Assaults". Hiện số bang + tổng Kills.
- Zone detail 3 tab: Tổng Quan (Top Guilds theo EXP/Kills) / Tập Kích / Bảng Xếp Hạng (cá nhân, Experience/Kills, **Season Reward = Hồn Thạch**: #1 20,000 / #2 15,000 / #3 10,000).
- **Mùa (~2 tháng)** reset. Chiếm zone → buff cho bang mùa sau.

### I6. Tửu Lâu (Tavern / Forum)
- Categories: General / Guild / Support / Suggestion / Trade / Games / Off-Topic / **LFG (Tìm Đội)**. Latest Posts + likes/comments + **Top Commenters** (Day→All Time).

### I7. Phong Vân Bảng (Leaderboard)
- Filter: Vị Trí (Your/Friends/Global) × Category (Combat Level / skill...) × Class. Update mỗi 12h.

### I8. Nhiệm Vụ (Quests)
- Location-based ("đang xem quest ở [vùng], đi nơi khác tìm thêm"). NPC giao (vd Ủy Thác Sứ Lucian). Multi-objective progress bar, reward Bạc. 3 tab: Chờ Nhận / Đã Nhận / Hoàn Thành.

---

## J. ĐỘNG PHỦ (House)

- 2 tab: **Doanh Tạo** (craft material + component) + **Động Phủ** (slot/component/condition/guest). Slot mặc định, mua thêm tới max 16.
- **Component chính = +Idle Time per-skill** (Sài Phòng/Khoáng Khố/Ngư Trang/Đan Phòng/Dã Luyện Lô/Trù Phòng/Đả Thiết Phường/Tĩnh Thất... bậc I→V: +30ph / +1h / +2h / +3h / +4h). + Training Grounds (battle), Adventurer's Lodge (dungeon), Trailblazer Camp (hunting), Ritual Plaza (event mastery).
- Foundation: 25,000 Bạc + 6h. Material wood-heavy. Bootstrap: phải có nhà (hoặc guest) mới gather material.
- **Decay/Tu Sửa**: xuống cấp 60/90 ngày (F2P/member); <80% → repair (tốn liệu+Bạc, càng để lâu càng đắt). Đang repair/decay = mất bonus (cả guest).
- **Khách Phòng (Guest)** I/II/III (1/2/3 khách): cho alt/bạn/người lạ hưởng buff; có thể thu phí. Guest house ưu tiên hơn nhà mình (nhà mình vẫn decay).
- **Đặc biệt**: Thiên Lý Truyền Tống Trận (Remote Conduit — bonus toàn cầu) · Linh Thú Lan (Pet Quarters — tự cho pet kiệt sức ngủ) · Trướng Phòng (House Ledger — giảm phí trade nội bộ char).
- Component bonus chỉ áp dụng khi ở đúng location nhà (trừ khi có Remote Conduit).

---

## K. BẢN ĐỒ & THỜI TIẾT

### K1. Bản đồ (artwork, 10 vùng, Lv 1 → 100)
Vùng mẫu (gốc IMMO, đặt Hán-Việt sau): Bluebell Hollow (Lv1) · Whispering Woods (Lv8) · Eldoria (Lv18) · Crystal Caverns (Lv32) · Skyreach Peak (Lv48) · Enchanted Oasis (Lv60) · Floating Gardens of Aetheria (Lv70) · Celestial Observatory (Lv78) · Isle of Whispers (Lv92) · The Citadel (Lv100).
- Location pin kèm Lv + icon thời tiết. Press-hold drag.
- Detail 2 tab: **Thông Tin** (lore, POI: Thần Đàn/Bí Cảnh/Boss/Quái, Lv đề xuất, khoảng cách + thời gian travel) + **Có Gì Ở Đây** (Items/Enemies/Dungeons/Bosses với Lv).
- **Khinh Công (Travel)** miễn phí, mất thời gian thực · **Truyền Tống (Teleport)** tốn Bạc (vd 25), tức thì.
- **Shooting Star (Sao Băng)**: spawn ngẫu nhiên theo location (khóa khi chưa có).

### K2. Thời tiết (Phase 1 = clone IMMO)
- Mỗi location + thời tiết → trade-off: **-Efficiency / +Mastery EXP** (vd Sương Mù: -10% Hunt Eff, +25% Hunt Mastery EXP; -10% Fish Eff, +20% Fish EXP...). Forecast 5 ngày × 4 slot. Đồng bộ giờ thực.
- *(Phase 2: thay bằng Tiết Khí 24 — xem §N.)*

---

## L. TIẾN TRÌNH META & SƯU TẦM

### L1. Phong Vân Lệnh (Campaign / Battle Pass)
- Reward track 15+ tier, mở bằng **Points**. Phần thưởng tier: Nguyên Bảo, Chest of Upgrade Stones, Đan, Teleportation Stone, Skin, Linh Thạch, Essence cao cấp...
- **Tasks 3 nhịp** (Ngày/Tuần/Tháng) cho Points + Bạc. Vd: "Dùng Phạt Mộc 735 lần", "Hạ 29 địch", "Hạ 18 Slimeball", "Mua 98 item từ Chợ", "Góp 345 item Guild Challenge", "Nâng cấp 2 món". Daily reset 24h.
- Nhiều campaign song song (mùa + event), switch được: vd Echoes of the Ascended (60 rewards), Ombric Uprising (40), Bluebell Festival (12). → xương sống retention.

### L2. Vạn Vật Phổ (Collection / Museum) — 6 tab
Dung Mạo (Skins) / Bối Cảnh (Backgrounds) / Bang Huy (Guild Icons) / Linh Thú (Pets) / Trân Phẩm (Collectibles) / **Yêu Thú Lục (Bestiary)**.
- Total Progress % (vd 48/178). **Milestone ladder**: yêu cầu tăng dần (10→25→50→75→120), thưởng **Nguyên Bảo + Hồn Thạch** cấp số (250 → 15,000 Hồn Thạch). Locked = silhouette, unlocked = màu.
- *(Phase 2: mở rộng theo concept U Minh Lộ.)*

---

## M. HỆ THỐNG & QoL

- **Class**: Combat (Warrior/Shadowblade/Ranger — battle talent Lv10/35/70) · Skill (Miner/Angler/Chef/Lumberjack/Smelter +10% Eff/EXP) · Beastmaster (+10% Pet Mastery) · **Hardcore locked**: Forsaken (-50% mọi EXP), Banished (cấm Market, -50% teleport, "ironman"), Cursed (Banished+Forsaken). Đổi class = Thoát Thai Đan, 1 lần/14 ngày.
- **Push Notification = retention engine**: Hoàn Thành Hành Động / **Nhắc Nhở Tu Luyện** (idle cạn → quay lại) / Động Phủ Xong / Thần Đàn Kích Hoạt / Phi Cáp Mới / Tửu Lâu mention.
- **Multi-char + Bản Tôn**: main +4h idle, đổi 1 lần/30 ngày. Account-settings vs Character-settings tách bạch. Toggle "Giữ Vị Trí" khi đổi char.
- **Privacy/QoL**: Ẩn Mặt (Appear Offline), **Hiện Tỉ Lệ Rớt Thật**, ẩn Recent Loot, UI Scale 5 mức, Auto Điểm Danh (member), Public API.

---

## N. PHASE 2 — TÙY BIẾN (làm SAU MVP)

1. **Ngũ hành + Tiết khí**: combat ngũ hành tương khắc (Kim→Mộc→Thổ→Thủy→Hỏa→Kim, +30%/-20%) fuse 24 Tiết Khí thay weather (Xuân/Mộc, Hạ/Hỏa, giao mùa/Thổ, Thu/Kim, Đông/Thủy → buff hệ tương ứng + trade-off eff/mastery). Đồng bộ giờ thực.
2. **Môn phái làm class + võ công MỚI**: 9 phái mapping ngũ hành (Kim=Thiên Vương/Thiếu Lâm, Mộc=Ngũ Độc/Đường Môn, Hỏa=Thiên Nhẫn/Cái Bang, Thủy=Nga Mi/Thúy Yên, Thổ=Võ Đang). **Hệ võ công thiết kế lại từ đầu — KHÔNG dùng cây Đường Môn cũ.**
3. **Truyền Công / Tọa Quan**: tinh chỉnh hệ vị tha cho hợp võ hiệp.
4. **Vạn Vật Phổ mở rộng** (concept U Minh Lộ).
5. **Chỉ số chi tiết võ hiệp**: 5 loại sát thương (vật lý/băng/độc/hỏa/lôi) + CC + cap kháng 75% + Nội Lực cho võ công.

---

## O. LỘ TRÌNH BUILD MVP (gợi ý thứ tự)

1. Khung 3 cột + **Universal Activity Widget** + top bar 3 currency
2. 1-2 skill gather (Phạt Mộc, Thải Khoáng) + Inventory + trang skill (predictive modal) + idle cap
3. Map + Travel/Teleport
4. Combat cơ bản (Chiến Đấu predictive) + Trang Bị paper-doll
5. Đủ 9 skill + chuỗi cung ứng + Phường Thị/Giao Dịch Hành
6. Pet · Bí Cảnh · Yêu Vương · Động Phủ · Bang Phái
7. Monetization (3 currency + Membership + Thần Đàn) · Phong Vân Lệnh · Vạn Vật Phổ · social

---

*Tham chiếu: tài liệu kiến trúc tóm tắt ở memory `project_tieudao.md`. Gốc clone: IdleMMO (wiki.idle-mmo.com).*
