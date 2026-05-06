"""Many small pure functions for integration and testing demos.

This module is intentionally large (demo PR). Each function is a trivial
deterministic blend of two integers in 0..65535.
"""

from __future__ import annotations

def blend_0(a: int, b: int) -> int:
    """Blend slot 0; result in 0..65535."""
    return ((a + b) * (0 + 1)) & 0xFFFF

def blend_1(a: int, b: int) -> int:
    """Blend slot 1; result in 0..65535."""
    return ((a + b) * (1 + 1)) & 0xFFFF

def blend_2(a: int, b: int) -> int:
    """Blend slot 2; result in 0..65535."""
    return ((a + b) * (2 + 1)) & 0xFFFF

def blend_3(a: int, b: int) -> int:
    """Blend slot 3; result in 0..65535."""
    return ((a + b) * (3 + 1)) & 0xFFFF

def blend_4(a: int, b: int) -> int:
    """Blend slot 4; result in 0..65535."""
    return ((a + b) * (4 + 1)) & 0xFFFF

def blend_5(a: int, b: int) -> int:
    """Blend slot 5; result in 0..65535."""
    return ((a + b) * (5 + 1)) & 0xFFFF

def blend_6(a: int, b: int) -> int:
    """Blend slot 6; result in 0..65535."""
    return ((a + b) * (6 + 1)) & 0xFFFF

def blend_7(a: int, b: int) -> int:
    """Blend slot 7; result in 0..65535."""
    return ((a + b) * (7 + 1)) & 0xFFFF

def blend_8(a: int, b: int) -> int:
    """Blend slot 8; result in 0..65535."""
    return ((a + b) * (8 + 1)) & 0xFFFF

def blend_9(a: int, b: int) -> int:
    """Blend slot 9; result in 0..65535."""
    return ((a + b) * (9 + 1)) & 0xFFFF

def blend_10(a: int, b: int) -> int:
    """Blend slot 10; result in 0..65535."""
    return ((a + b) * (10 + 1)) & 0xFFFF

def blend_11(a: int, b: int) -> int:
    """Blend slot 11; result in 0..65535."""
    return ((a + b) * (11 + 1)) & 0xFFFF

def blend_12(a: int, b: int) -> int:
    """Blend slot 12; result in 0..65535."""
    return ((a + b) * (12 + 1)) & 0xFFFF

def blend_13(a: int, b: int) -> int:
    """Blend slot 13; result in 0..65535."""
    return ((a + b) * (13 + 1)) & 0xFFFF

def blend_14(a: int, b: int) -> int:
    """Blend slot 14; result in 0..65535."""
    return ((a + b) * (14 + 1)) & 0xFFFF

def blend_15(a: int, b: int) -> int:
    """Blend slot 15; result in 0..65535."""
    return ((a + b) * (15 + 1)) & 0xFFFF

def blend_16(a: int, b: int) -> int:
    """Blend slot 16; result in 0..65535."""
    return ((a + b) * (16 + 1)) & 0xFFFF

def blend_17(a: int, b: int) -> int:
    """Blend slot 17; result in 0..65535."""
    return ((a + b) * (17 + 1)) & 0xFFFF

def blend_18(a: int, b: int) -> int:
    """Blend slot 18; result in 0..65535."""
    return ((a + b) * (18 + 1)) & 0xFFFF

def blend_19(a: int, b: int) -> int:
    """Blend slot 19; result in 0..65535."""
    return ((a + b) * (19 + 1)) & 0xFFFF

def blend_20(a: int, b: int) -> int:
    """Blend slot 20; result in 0..65535."""
    return ((a + b) * (20 + 1)) & 0xFFFF

def blend_21(a: int, b: int) -> int:
    """Blend slot 21; result in 0..65535."""
    return ((a + b) * (21 + 1)) & 0xFFFF

def blend_22(a: int, b: int) -> int:
    """Blend slot 22; result in 0..65535."""
    return ((a + b) * (22 + 1)) & 0xFFFF

def blend_23(a: int, b: int) -> int:
    """Blend slot 23; result in 0..65535."""
    return ((a + b) * (23 + 1)) & 0xFFFF

def blend_24(a: int, b: int) -> int:
    """Blend slot 24; result in 0..65535."""
    return ((a + b) * (24 + 1)) & 0xFFFF

def blend_25(a: int, b: int) -> int:
    """Blend slot 25; result in 0..65535."""
    return ((a + b) * (25 + 1)) & 0xFFFF

def blend_26(a: int, b: int) -> int:
    """Blend slot 26; result in 0..65535."""
    return ((a + b) * (26 + 1)) & 0xFFFF

def blend_27(a: int, b: int) -> int:
    """Blend slot 27; result in 0..65535."""
    return ((a + b) * (27 + 1)) & 0xFFFF

def blend_28(a: int, b: int) -> int:
    """Blend slot 28; result in 0..65535."""
    return ((a + b) * (28 + 1)) & 0xFFFF

def blend_29(a: int, b: int) -> int:
    """Blend slot 29; result in 0..65535."""
    return ((a + b) * (29 + 1)) & 0xFFFF

def blend_30(a: int, b: int) -> int:
    """Blend slot 30; result in 0..65535."""
    return ((a + b) * (30 + 1)) & 0xFFFF

def blend_31(a: int, b: int) -> int:
    """Blend slot 31; result in 0..65535."""
    return ((a + b) * (31 + 1)) & 0xFFFF

def blend_32(a: int, b: int) -> int:
    """Blend slot 32; result in 0..65535."""
    return ((a + b) * (32 + 1)) & 0xFFFF

def blend_33(a: int, b: int) -> int:
    """Blend slot 33; result in 0..65535."""
    return ((a + b) * (33 + 1)) & 0xFFFF

def blend_34(a: int, b: int) -> int:
    """Blend slot 34; result in 0..65535."""
    return ((a + b) * (34 + 1)) & 0xFFFF

def blend_35(a: int, b: int) -> int:
    """Blend slot 35; result in 0..65535."""
    return ((a + b) * (35 + 1)) & 0xFFFF

def blend_36(a: int, b: int) -> int:
    """Blend slot 36; result in 0..65535."""
    return ((a + b) * (36 + 1)) & 0xFFFF

def blend_37(a: int, b: int) -> int:
    """Blend slot 37; result in 0..65535."""
    return ((a + b) * (37 + 1)) & 0xFFFF

def blend_38(a: int, b: int) -> int:
    """Blend slot 38; result in 0..65535."""
    return ((a + b) * (38 + 1)) & 0xFFFF

def blend_39(a: int, b: int) -> int:
    """Blend slot 39; result in 0..65535."""
    return ((a + b) * (39 + 1)) & 0xFFFF

def blend_40(a: int, b: int) -> int:
    """Blend slot 40; result in 0..65535."""
    return ((a + b) * (40 + 1)) & 0xFFFF

def blend_41(a: int, b: int) -> int:
    """Blend slot 41; result in 0..65535."""
    return ((a + b) * (41 + 1)) & 0xFFFF

def blend_42(a: int, b: int) -> int:
    """Blend slot 42; result in 0..65535."""
    return ((a + b) * (42 + 1)) & 0xFFFF

def blend_43(a: int, b: int) -> int:
    """Blend slot 43; result in 0..65535."""
    return ((a + b) * (43 + 1)) & 0xFFFF

def blend_44(a: int, b: int) -> int:
    """Blend slot 44; result in 0..65535."""
    return ((a + b) * (44 + 1)) & 0xFFFF

def blend_45(a: int, b: int) -> int:
    """Blend slot 45; result in 0..65535."""
    return ((a + b) * (45 + 1)) & 0xFFFF

def blend_46(a: int, b: int) -> int:
    """Blend slot 46; result in 0..65535."""
    return ((a + b) * (46 + 1)) & 0xFFFF

def blend_47(a: int, b: int) -> int:
    """Blend slot 47; result in 0..65535."""
    return ((a + b) * (47 + 1)) & 0xFFFF

def blend_48(a: int, b: int) -> int:
    """Blend slot 48; result in 0..65535."""
    return ((a + b) * (48 + 1)) & 0xFFFF

def blend_49(a: int, b: int) -> int:
    """Blend slot 49; result in 0..65535."""
    return ((a + b) * (49 + 1)) & 0xFFFF

def blend_50(a: int, b: int) -> int:
    """Blend slot 50; result in 0..65535."""
    return ((a + b) * (50 + 1)) & 0xFFFF

def blend_51(a: int, b: int) -> int:
    """Blend slot 51; result in 0..65535."""
    return ((a + b) * (51 + 1)) & 0xFFFF

def blend_52(a: int, b: int) -> int:
    """Blend slot 52; result in 0..65535."""
    return ((a + b) * (52 + 1)) & 0xFFFF

def blend_53(a: int, b: int) -> int:
    """Blend slot 53; result in 0..65535."""
    return ((a + b) * (53 + 1)) & 0xFFFF

def blend_54(a: int, b: int) -> int:
    """Blend slot 54; result in 0..65535."""
    return ((a + b) * (54 + 1)) & 0xFFFF

def blend_55(a: int, b: int) -> int:
    """Blend slot 55; result in 0..65535."""
    return ((a + b) * (55 + 1)) & 0xFFFF

def blend_56(a: int, b: int) -> int:
    """Blend slot 56; result in 0..65535."""
    return ((a + b) * (56 + 1)) & 0xFFFF

def blend_57(a: int, b: int) -> int:
    """Blend slot 57; result in 0..65535."""
    return ((a + b) * (57 + 1)) & 0xFFFF

def blend_58(a: int, b: int) -> int:
    """Blend slot 58; result in 0..65535."""
    return ((a + b) * (58 + 1)) & 0xFFFF

def blend_59(a: int, b: int) -> int:
    """Blend slot 59; result in 0..65535."""
    return ((a + b) * (59 + 1)) & 0xFFFF

def blend_60(a: int, b: int) -> int:
    """Blend slot 60; result in 0..65535."""
    return ((a + b) * (60 + 1)) & 0xFFFF

def blend_61(a: int, b: int) -> int:
    """Blend slot 61; result in 0..65535."""
    return ((a + b) * (61 + 1)) & 0xFFFF

def blend_62(a: int, b: int) -> int:
    """Blend slot 62; result in 0..65535."""
    return ((a + b) * (62 + 1)) & 0xFFFF

def blend_63(a: int, b: int) -> int:
    """Blend slot 63; result in 0..65535."""
    return ((a + b) * (63 + 1)) & 0xFFFF

def blend_64(a: int, b: int) -> int:
    """Blend slot 64; result in 0..65535."""
    return ((a + b) * (64 + 1)) & 0xFFFF

def blend_65(a: int, b: int) -> int:
    """Blend slot 65; result in 0..65535."""
    return ((a + b) * (65 + 1)) & 0xFFFF

def blend_66(a: int, b: int) -> int:
    """Blend slot 66; result in 0..65535."""
    return ((a + b) * (66 + 1)) & 0xFFFF

def blend_67(a: int, b: int) -> int:
    """Blend slot 67; result in 0..65535."""
    return ((a + b) * (67 + 1)) & 0xFFFF

def blend_68(a: int, b: int) -> int:
    """Blend slot 68; result in 0..65535."""
    return ((a + b) * (68 + 1)) & 0xFFFF

def blend_69(a: int, b: int) -> int:
    """Blend slot 69; result in 0..65535."""
    return ((a + b) * (69 + 1)) & 0xFFFF

def blend_70(a: int, b: int) -> int:
    """Blend slot 70; result in 0..65535."""
    return ((a + b) * (70 + 1)) & 0xFFFF

def blend_71(a: int, b: int) -> int:
    """Blend slot 71; result in 0..65535."""
    return ((a + b) * (71 + 1)) & 0xFFFF

def blend_72(a: int, b: int) -> int:
    """Blend slot 72; result in 0..65535."""
    return ((a + b) * (72 + 1)) & 0xFFFF

def blend_73(a: int, b: int) -> int:
    """Blend slot 73; result in 0..65535."""
    return ((a + b) * (73 + 1)) & 0xFFFF

def blend_74(a: int, b: int) -> int:
    """Blend slot 74; result in 0..65535."""
    return ((a + b) * (74 + 1)) & 0xFFFF

def blend_75(a: int, b: int) -> int:
    """Blend slot 75; result in 0..65535."""
    return ((a + b) * (75 + 1)) & 0xFFFF

def blend_76(a: int, b: int) -> int:
    """Blend slot 76; result in 0..65535."""
    return ((a + b) * (76 + 1)) & 0xFFFF

def blend_77(a: int, b: int) -> int:
    """Blend slot 77; result in 0..65535."""
    return ((a + b) * (77 + 1)) & 0xFFFF

def blend_78(a: int, b: int) -> int:
    """Blend slot 78; result in 0..65535."""
    return ((a + b) * (78 + 1)) & 0xFFFF

def blend_79(a: int, b: int) -> int:
    """Blend slot 79; result in 0..65535."""
    return ((a + b) * (79 + 1)) & 0xFFFF

def blend_80(a: int, b: int) -> int:
    """Blend slot 80; result in 0..65535."""
    return ((a + b) * (80 + 1)) & 0xFFFF

def blend_81(a: int, b: int) -> int:
    """Blend slot 81; result in 0..65535."""
    return ((a + b) * (81 + 1)) & 0xFFFF

def blend_82(a: int, b: int) -> int:
    """Blend slot 82; result in 0..65535."""
    return ((a + b) * (82 + 1)) & 0xFFFF

def blend_83(a: int, b: int) -> int:
    """Blend slot 83; result in 0..65535."""
    return ((a + b) * (83 + 1)) & 0xFFFF

def blend_84(a: int, b: int) -> int:
    """Blend slot 84; result in 0..65535."""
    return ((a + b) * (84 + 1)) & 0xFFFF

def blend_85(a: int, b: int) -> int:
    """Blend slot 85; result in 0..65535."""
    return ((a + b) * (85 + 1)) & 0xFFFF

def blend_86(a: int, b: int) -> int:
    """Blend slot 86; result in 0..65535."""
    return ((a + b) * (86 + 1)) & 0xFFFF

def blend_87(a: int, b: int) -> int:
    """Blend slot 87; result in 0..65535."""
    return ((a + b) * (87 + 1)) & 0xFFFF

def blend_88(a: int, b: int) -> int:
    """Blend slot 88; result in 0..65535."""
    return ((a + b) * (88 + 1)) & 0xFFFF

def blend_89(a: int, b: int) -> int:
    """Blend slot 89; result in 0..65535."""
    return ((a + b) * (89 + 1)) & 0xFFFF

def blend_90(a: int, b: int) -> int:
    """Blend slot 90; result in 0..65535."""
    return ((a + b) * (90 + 1)) & 0xFFFF

def blend_91(a: int, b: int) -> int:
    """Blend slot 91; result in 0..65535."""
    return ((a + b) * (91 + 1)) & 0xFFFF

def blend_92(a: int, b: int) -> int:
    """Blend slot 92; result in 0..65535."""
    return ((a + b) * (92 + 1)) & 0xFFFF

def blend_93(a: int, b: int) -> int:
    """Blend slot 93; result in 0..65535."""
    return ((a + b) * (93 + 1)) & 0xFFFF

def blend_94(a: int, b: int) -> int:
    """Blend slot 94; result in 0..65535."""
    return ((a + b) * (94 + 1)) & 0xFFFF

def blend_95(a: int, b: int) -> int:
    """Blend slot 95; result in 0..65535."""
    return ((a + b) * (95 + 1)) & 0xFFFF

def blend_96(a: int, b: int) -> int:
    """Blend slot 96; result in 0..65535."""
    return ((a + b) * (96 + 1)) & 0xFFFF

def blend_97(a: int, b: int) -> int:
    """Blend slot 97; result in 0..65535."""
    return ((a + b) * (97 + 1)) & 0xFFFF

def blend_98(a: int, b: int) -> int:
    """Blend slot 98; result in 0..65535."""
    return ((a + b) * (98 + 1)) & 0xFFFF

def blend_99(a: int, b: int) -> int:
    """Blend slot 99; result in 0..65535."""
    return ((a + b) * (99 + 1)) & 0xFFFF

def blend_100(a: int, b: int) -> int:
    """Blend slot 100; result in 0..65535."""
    return ((a + b) * (100 + 1)) & 0xFFFF

def blend_101(a: int, b: int) -> int:
    """Blend slot 101; result in 0..65535."""
    return ((a + b) * (101 + 1)) & 0xFFFF

def blend_102(a: int, b: int) -> int:
    """Blend slot 102; result in 0..65535."""
    return ((a + b) * (102 + 1)) & 0xFFFF

def blend_103(a: int, b: int) -> int:
    """Blend slot 103; result in 0..65535."""
    return ((a + b) * (103 + 1)) & 0xFFFF

def blend_104(a: int, b: int) -> int:
    """Blend slot 104; result in 0..65535."""
    return ((a + b) * (104 + 1)) & 0xFFFF

def blend_105(a: int, b: int) -> int:
    """Blend slot 105; result in 0..65535."""
    return ((a + b) * (105 + 1)) & 0xFFFF

def blend_106(a: int, b: int) -> int:
    """Blend slot 106; result in 0..65535."""
    return ((a + b) * (106 + 1)) & 0xFFFF

def blend_107(a: int, b: int) -> int:
    """Blend slot 107; result in 0..65535."""
    return ((a + b) * (107 + 1)) & 0xFFFF

def blend_108(a: int, b: int) -> int:
    """Blend slot 108; result in 0..65535."""
    return ((a + b) * (108 + 1)) & 0xFFFF

def blend_109(a: int, b: int) -> int:
    """Blend slot 109; result in 0..65535."""
    return ((a + b) * (109 + 1)) & 0xFFFF

def blend_110(a: int, b: int) -> int:
    """Blend slot 110; result in 0..65535."""
    return ((a + b) * (110 + 1)) & 0xFFFF

def blend_111(a: int, b: int) -> int:
    """Blend slot 111; result in 0..65535."""
    return ((a + b) * (111 + 1)) & 0xFFFF

def blend_112(a: int, b: int) -> int:
    """Blend slot 112; result in 0..65535."""
    return ((a + b) * (112 + 1)) & 0xFFFF

def blend_113(a: int, b: int) -> int:
    """Blend slot 113; result in 0..65535."""
    return ((a + b) * (113 + 1)) & 0xFFFF

def blend_114(a: int, b: int) -> int:
    """Blend slot 114; result in 0..65535."""
    return ((a + b) * (114 + 1)) & 0xFFFF

def blend_115(a: int, b: int) -> int:
    """Blend slot 115; result in 0..65535."""
    return ((a + b) * (115 + 1)) & 0xFFFF

def blend_116(a: int, b: int) -> int:
    """Blend slot 116; result in 0..65535."""
    return ((a + b) * (116 + 1)) & 0xFFFF

def blend_117(a: int, b: int) -> int:
    """Blend slot 117; result in 0..65535."""
    return ((a + b) * (117 + 1)) & 0xFFFF

def blend_118(a: int, b: int) -> int:
    """Blend slot 118; result in 0..65535."""
    return ((a + b) * (118 + 1)) & 0xFFFF

def blend_119(a: int, b: int) -> int:
    """Blend slot 119; result in 0..65535."""
    return ((a + b) * (119 + 1)) & 0xFFFF

def blend_120(a: int, b: int) -> int:
    """Blend slot 120; result in 0..65535."""
    return ((a + b) * (120 + 1)) & 0xFFFF

def blend_121(a: int, b: int) -> int:
    """Blend slot 121; result in 0..65535."""
    return ((a + b) * (121 + 1)) & 0xFFFF

def blend_122(a: int, b: int) -> int:
    """Blend slot 122; result in 0..65535."""
    return ((a + b) * (122 + 1)) & 0xFFFF

def blend_123(a: int, b: int) -> int:
    """Blend slot 123; result in 0..65535."""
    return ((a + b) * (123 + 1)) & 0xFFFF

def blend_124(a: int, b: int) -> int:
    """Blend slot 124; result in 0..65535."""
    return ((a + b) * (124 + 1)) & 0xFFFF

def blend_125(a: int, b: int) -> int:
    """Blend slot 125; result in 0..65535."""
    return ((a + b) * (125 + 1)) & 0xFFFF

def blend_126(a: int, b: int) -> int:
    """Blend slot 126; result in 0..65535."""
    return ((a + b) * (126 + 1)) & 0xFFFF

def blend_127(a: int, b: int) -> int:
    """Blend slot 127; result in 0..65535."""
    return ((a + b) * (127 + 1)) & 0xFFFF

def blend_128(a: int, b: int) -> int:
    """Blend slot 128; result in 0..65535."""
    return ((a + b) * (128 + 1)) & 0xFFFF

def blend_129(a: int, b: int) -> int:
    """Blend slot 129; result in 0..65535."""
    return ((a + b) * (129 + 1)) & 0xFFFF

def blend_130(a: int, b: int) -> int:
    """Blend slot 130; result in 0..65535."""
    return ((a + b) * (130 + 1)) & 0xFFFF

def blend_131(a: int, b: int) -> int:
    """Blend slot 131; result in 0..65535."""
    return ((a + b) * (131 + 1)) & 0xFFFF

def blend_132(a: int, b: int) -> int:
    """Blend slot 132; result in 0..65535."""
    return ((a + b) * (132 + 1)) & 0xFFFF

def blend_133(a: int, b: int) -> int:
    """Blend slot 133; result in 0..65535."""
    return ((a + b) * (133 + 1)) & 0xFFFF

def blend_134(a: int, b: int) -> int:
    """Blend slot 134; result in 0..65535."""
    return ((a + b) * (134 + 1)) & 0xFFFF

def blend_135(a: int, b: int) -> int:
    """Blend slot 135; result in 0..65535."""
    return ((a + b) * (135 + 1)) & 0xFFFF

def blend_136(a: int, b: int) -> int:
    """Blend slot 136; result in 0..65535."""
    return ((a + b) * (136 + 1)) & 0xFFFF

def blend_137(a: int, b: int) -> int:
    """Blend slot 137; result in 0..65535."""
    return ((a + b) * (137 + 1)) & 0xFFFF

def blend_138(a: int, b: int) -> int:
    """Blend slot 138; result in 0..65535."""
    return ((a + b) * (138 + 1)) & 0xFFFF

def blend_139(a: int, b: int) -> int:
    """Blend slot 139; result in 0..65535."""
    return ((a + b) * (139 + 1)) & 0xFFFF

def blend_140(a: int, b: int) -> int:
    """Blend slot 140; result in 0..65535."""
    return ((a + b) * (140 + 1)) & 0xFFFF

def blend_141(a: int, b: int) -> int:
    """Blend slot 141; result in 0..65535."""
    return ((a + b) * (141 + 1)) & 0xFFFF

def blend_142(a: int, b: int) -> int:
    """Blend slot 142; result in 0..65535."""
    return ((a + b) * (142 + 1)) & 0xFFFF

def blend_143(a: int, b: int) -> int:
    """Blend slot 143; result in 0..65535."""
    return ((a + b) * (143 + 1)) & 0xFFFF

def blend_144(a: int, b: int) -> int:
    """Blend slot 144; result in 0..65535."""
    return ((a + b) * (144 + 1)) & 0xFFFF

def blend_145(a: int, b: int) -> int:
    """Blend slot 145; result in 0..65535."""
    return ((a + b) * (145 + 1)) & 0xFFFF

def blend_146(a: int, b: int) -> int:
    """Blend slot 146; result in 0..65535."""
    return ((a + b) * (146 + 1)) & 0xFFFF

def blend_147(a: int, b: int) -> int:
    """Blend slot 147; result in 0..65535."""
    return ((a + b) * (147 + 1)) & 0xFFFF

def blend_148(a: int, b: int) -> int:
    """Blend slot 148; result in 0..65535."""
    return ((a + b) * (148 + 1)) & 0xFFFF

def blend_149(a: int, b: int) -> int:
    """Blend slot 149; result in 0..65535."""
    return ((a + b) * (149 + 1)) & 0xFFFF

def blend_150(a: int, b: int) -> int:
    """Blend slot 150; result in 0..65535."""
    return ((a + b) * (150 + 1)) & 0xFFFF

def blend_151(a: int, b: int) -> int:
    """Blend slot 151; result in 0..65535."""
    return ((a + b) * (151 + 1)) & 0xFFFF

def blend_152(a: int, b: int) -> int:
    """Blend slot 152; result in 0..65535."""
    return ((a + b) * (152 + 1)) & 0xFFFF

def blend_153(a: int, b: int) -> int:
    """Blend slot 153; result in 0..65535."""
    return ((a + b) * (153 + 1)) & 0xFFFF

def blend_154(a: int, b: int) -> int:
    """Blend slot 154; result in 0..65535."""
    return ((a + b) * (154 + 1)) & 0xFFFF

def blend_155(a: int, b: int) -> int:
    """Blend slot 155; result in 0..65535."""
    return ((a + b) * (155 + 1)) & 0xFFFF

def blend_156(a: int, b: int) -> int:
    """Blend slot 156; result in 0..65535."""
    return ((a + b) * (156 + 1)) & 0xFFFF

def blend_157(a: int, b: int) -> int:
    """Blend slot 157; result in 0..65535."""
    return ((a + b) * (157 + 1)) & 0xFFFF

def blend_158(a: int, b: int) -> int:
    """Blend slot 158; result in 0..65535."""
    return ((a + b) * (158 + 1)) & 0xFFFF

def blend_159(a: int, b: int) -> int:
    """Blend slot 159; result in 0..65535."""
    return ((a + b) * (159 + 1)) & 0xFFFF

def blend_160(a: int, b: int) -> int:
    """Blend slot 160; result in 0..65535."""
    return ((a + b) * (160 + 1)) & 0xFFFF

def blend_161(a: int, b: int) -> int:
    """Blend slot 161; result in 0..65535."""
    return ((a + b) * (161 + 1)) & 0xFFFF

def blend_162(a: int, b: int) -> int:
    """Blend slot 162; result in 0..65535."""
    return ((a + b) * (162 + 1)) & 0xFFFF

def blend_163(a: int, b: int) -> int:
    """Blend slot 163; result in 0..65535."""
    return ((a + b) * (163 + 1)) & 0xFFFF

def blend_164(a: int, b: int) -> int:
    """Blend slot 164; result in 0..65535."""
    return ((a + b) * (164 + 1)) & 0xFFFF

def blend_165(a: int, b: int) -> int:
    """Blend slot 165; result in 0..65535."""
    return ((a + b) * (165 + 1)) & 0xFFFF

def blend_166(a: int, b: int) -> int:
    """Blend slot 166; result in 0..65535."""
    return ((a + b) * (166 + 1)) & 0xFFFF

def blend_167(a: int, b: int) -> int:
    """Blend slot 167; result in 0..65535."""
    return ((a + b) * (167 + 1)) & 0xFFFF

def blend_168(a: int, b: int) -> int:
    """Blend slot 168; result in 0..65535."""
    return ((a + b) * (168 + 1)) & 0xFFFF

def blend_169(a: int, b: int) -> int:
    """Blend slot 169; result in 0..65535."""
    return ((a + b) * (169 + 1)) & 0xFFFF

def blend_170(a: int, b: int) -> int:
    """Blend slot 170; result in 0..65535."""
    return ((a + b) * (170 + 1)) & 0xFFFF

def blend_171(a: int, b: int) -> int:
    """Blend slot 171; result in 0..65535."""
    return ((a + b) * (171 + 1)) & 0xFFFF

def blend_172(a: int, b: int) -> int:
    """Blend slot 172; result in 0..65535."""
    return ((a + b) * (172 + 1)) & 0xFFFF

def blend_173(a: int, b: int) -> int:
    """Blend slot 173; result in 0..65535."""
    return ((a + b) * (173 + 1)) & 0xFFFF

def blend_174(a: int, b: int) -> int:
    """Blend slot 174; result in 0..65535."""
    return ((a + b) * (174 + 1)) & 0xFFFF

def blend_175(a: int, b: int) -> int:
    """Blend slot 175; result in 0..65535."""
    return ((a + b) * (175 + 1)) & 0xFFFF

def blend_176(a: int, b: int) -> int:
    """Blend slot 176; result in 0..65535."""
    return ((a + b) * (176 + 1)) & 0xFFFF

def blend_177(a: int, b: int) -> int:
    """Blend slot 177; result in 0..65535."""
    return ((a + b) * (177 + 1)) & 0xFFFF

def blend_178(a: int, b: int) -> int:
    """Blend slot 178; result in 0..65535."""
    return ((a + b) * (178 + 1)) & 0xFFFF

def blend_179(a: int, b: int) -> int:
    """Blend slot 179; result in 0..65535."""
    return ((a + b) * (179 + 1)) & 0xFFFF

def blend_180(a: int, b: int) -> int:
    """Blend slot 180; result in 0..65535."""
    return ((a + b) * (180 + 1)) & 0xFFFF

def blend_181(a: int, b: int) -> int:
    """Blend slot 181; result in 0..65535."""
    return ((a + b) * (181 + 1)) & 0xFFFF

def blend_182(a: int, b: int) -> int:
    """Blend slot 182; result in 0..65535."""
    return ((a + b) * (182 + 1)) & 0xFFFF

def blend_183(a: int, b: int) -> int:
    """Blend slot 183; result in 0..65535."""
    return ((a + b) * (183 + 1)) & 0xFFFF

def blend_184(a: int, b: int) -> int:
    """Blend slot 184; result in 0..65535."""
    return ((a + b) * (184 + 1)) & 0xFFFF

def blend_185(a: int, b: int) -> int:
    """Blend slot 185; result in 0..65535."""
    return ((a + b) * (185 + 1)) & 0xFFFF

def blend_186(a: int, b: int) -> int:
    """Blend slot 186; result in 0..65535."""
    return ((a + b) * (186 + 1)) & 0xFFFF

def blend_187(a: int, b: int) -> int:
    """Blend slot 187; result in 0..65535."""
    return ((a + b) * (187 + 1)) & 0xFFFF

def blend_188(a: int, b: int) -> int:
    """Blend slot 188; result in 0..65535."""
    return ((a + b) * (188 + 1)) & 0xFFFF

def blend_189(a: int, b: int) -> int:
    """Blend slot 189; result in 0..65535."""
    return ((a + b) * (189 + 1)) & 0xFFFF

def blend_190(a: int, b: int) -> int:
    """Blend slot 190; result in 0..65535."""
    return ((a + b) * (190 + 1)) & 0xFFFF

def blend_191(a: int, b: int) -> int:
    """Blend slot 191; result in 0..65535."""
    return ((a + b) * (191 + 1)) & 0xFFFF

def blend_192(a: int, b: int) -> int:
    """Blend slot 192; result in 0..65535."""
    return ((a + b) * (192 + 1)) & 0xFFFF

def blend_193(a: int, b: int) -> int:
    """Blend slot 193; result in 0..65535."""
    return ((a + b) * (193 + 1)) & 0xFFFF

def blend_194(a: int, b: int) -> int:
    """Blend slot 194; result in 0..65535."""
    return ((a + b) * (194 + 1)) & 0xFFFF

def blend_195(a: int, b: int) -> int:
    """Blend slot 195; result in 0..65535."""
    return ((a + b) * (195 + 1)) & 0xFFFF

def blend_196(a: int, b: int) -> int:
    """Blend slot 196; result in 0..65535."""
    return ((a + b) * (196 + 1)) & 0xFFFF

def blend_197(a: int, b: int) -> int:
    """Blend slot 197; result in 0..65535."""
    return ((a + b) * (197 + 1)) & 0xFFFF

def blend_198(a: int, b: int) -> int:
    """Blend slot 198; result in 0..65535."""
    return ((a + b) * (198 + 1)) & 0xFFFF

def blend_199(a: int, b: int) -> int:
    """Blend slot 199; result in 0..65535."""
    return ((a + b) * (199 + 1)) & 0xFFFF

def blend_200(a: int, b: int) -> int:
    """Blend slot 200; result in 0..65535."""
    return ((a + b) * (200 + 1)) & 0xFFFF

def blend_201(a: int, b: int) -> int:
    """Blend slot 201; result in 0..65535."""
    return ((a + b) * (201 + 1)) & 0xFFFF

def blend_202(a: int, b: int) -> int:
    """Blend slot 202; result in 0..65535."""
    return ((a + b) * (202 + 1)) & 0xFFFF

def blend_203(a: int, b: int) -> int:
    """Blend slot 203; result in 0..65535."""
    return ((a + b) * (203 + 1)) & 0xFFFF

def blend_204(a: int, b: int) -> int:
    """Blend slot 204; result in 0..65535."""
    return ((a + b) * (204 + 1)) & 0xFFFF

def blend_205(a: int, b: int) -> int:
    """Blend slot 205; result in 0..65535."""
    return ((a + b) * (205 + 1)) & 0xFFFF

def blend_206(a: int, b: int) -> int:
    """Blend slot 206; result in 0..65535."""
    return ((a + b) * (206 + 1)) & 0xFFFF

def blend_207(a: int, b: int) -> int:
    """Blend slot 207; result in 0..65535."""
    return ((a + b) * (207 + 1)) & 0xFFFF

def blend_208(a: int, b: int) -> int:
    """Blend slot 208; result in 0..65535."""
    return ((a + b) * (208 + 1)) & 0xFFFF

def blend_209(a: int, b: int) -> int:
    """Blend slot 209; result in 0..65535."""
    return ((a + b) * (209 + 1)) & 0xFFFF

def blend_210(a: int, b: int) -> int:
    """Blend slot 210; result in 0..65535."""
    return ((a + b) * (210 + 1)) & 0xFFFF

def blend_211(a: int, b: int) -> int:
    """Blend slot 211; result in 0..65535."""
    return ((a + b) * (211 + 1)) & 0xFFFF

def blend_212(a: int, b: int) -> int:
    """Blend slot 212; result in 0..65535."""
    return ((a + b) * (212 + 1)) & 0xFFFF

def blend_213(a: int, b: int) -> int:
    """Blend slot 213; result in 0..65535."""
    return ((a + b) * (213 + 1)) & 0xFFFF

def blend_214(a: int, b: int) -> int:
    """Blend slot 214; result in 0..65535."""
    return ((a + b) * (214 + 1)) & 0xFFFF

def blend_215(a: int, b: int) -> int:
    """Blend slot 215; result in 0..65535."""
    return ((a + b) * (215 + 1)) & 0xFFFF

def blend_216(a: int, b: int) -> int:
    """Blend slot 216; result in 0..65535."""
    return ((a + b) * (216 + 1)) & 0xFFFF

def blend_217(a: int, b: int) -> int:
    """Blend slot 217; result in 0..65535."""
    return ((a + b) * (217 + 1)) & 0xFFFF

def blend_218(a: int, b: int) -> int:
    """Blend slot 218; result in 0..65535."""
    return ((a + b) * (218 + 1)) & 0xFFFF

def blend_219(a: int, b: int) -> int:
    """Blend slot 219; result in 0..65535."""
    return ((a + b) * (219 + 1)) & 0xFFFF

def blend_220(a: int, b: int) -> int:
    """Blend slot 220; result in 0..65535."""
    return ((a + b) * (220 + 1)) & 0xFFFF

def blend_221(a: int, b: int) -> int:
    """Blend slot 221; result in 0..65535."""
    return ((a + b) * (221 + 1)) & 0xFFFF

def blend_222(a: int, b: int) -> int:
    """Blend slot 222; result in 0..65535."""
    return ((a + b) * (222 + 1)) & 0xFFFF

def blend_223(a: int, b: int) -> int:
    """Blend slot 223; result in 0..65535."""
    return ((a + b) * (223 + 1)) & 0xFFFF

def blend_224(a: int, b: int) -> int:
    """Blend slot 224; result in 0..65535."""
    return ((a + b) * (224 + 1)) & 0xFFFF

def blend_225(a: int, b: int) -> int:
    """Blend slot 225; result in 0..65535."""
    return ((a + b) * (225 + 1)) & 0xFFFF

def blend_226(a: int, b: int) -> int:
    """Blend slot 226; result in 0..65535."""
    return ((a + b) * (226 + 1)) & 0xFFFF

def blend_227(a: int, b: int) -> int:
    """Blend slot 227; result in 0..65535."""
    return ((a + b) * (227 + 1)) & 0xFFFF

def blend_228(a: int, b: int) -> int:
    """Blend slot 228; result in 0..65535."""
    return ((a + b) * (228 + 1)) & 0xFFFF

def blend_229(a: int, b: int) -> int:
    """Blend slot 229; result in 0..65535."""
    return ((a + b) * (229 + 1)) & 0xFFFF

def blend_230(a: int, b: int) -> int:
    """Blend slot 230; result in 0..65535."""
    return ((a + b) * (230 + 1)) & 0xFFFF

def blend_231(a: int, b: int) -> int:
    """Blend slot 231; result in 0..65535."""
    return ((a + b) * (231 + 1)) & 0xFFFF

def blend_232(a: int, b: int) -> int:
    """Blend slot 232; result in 0..65535."""
    return ((a + b) * (232 + 1)) & 0xFFFF

def blend_233(a: int, b: int) -> int:
    """Blend slot 233; result in 0..65535."""
    return ((a + b) * (233 + 1)) & 0xFFFF

def blend_234(a: int, b: int) -> int:
    """Blend slot 234; result in 0..65535."""
    return ((a + b) * (234 + 1)) & 0xFFFF

def blend_235(a: int, b: int) -> int:
    """Blend slot 235; result in 0..65535."""
    return ((a + b) * (235 + 1)) & 0xFFFF

def blend_236(a: int, b: int) -> int:
    """Blend slot 236; result in 0..65535."""
    return ((a + b) * (236 + 1)) & 0xFFFF

def blend_237(a: int, b: int) -> int:
    """Blend slot 237; result in 0..65535."""
    return ((a + b) * (237 + 1)) & 0xFFFF

def blend_238(a: int, b: int) -> int:
    """Blend slot 238; result in 0..65535."""
    return ((a + b) * (238 + 1)) & 0xFFFF

def blend_239(a: int, b: int) -> int:
    """Blend slot 239; result in 0..65535."""
    return ((a + b) * (239 + 1)) & 0xFFFF

def blend_240(a: int, b: int) -> int:
    """Blend slot 240; result in 0..65535."""
    return ((a + b) * (240 + 1)) & 0xFFFF

def blend_241(a: int, b: int) -> int:
    """Blend slot 241; result in 0..65535."""
    return ((a + b) * (241 + 1)) & 0xFFFF

def blend_242(a: int, b: int) -> int:
    """Blend slot 242; result in 0..65535."""
    return ((a + b) * (242 + 1)) & 0xFFFF

def blend_243(a: int, b: int) -> int:
    """Blend slot 243; result in 0..65535."""
    return ((a + b) * (243 + 1)) & 0xFFFF

def blend_244(a: int, b: int) -> int:
    """Blend slot 244; result in 0..65535."""
    return ((a + b) * (244 + 1)) & 0xFFFF

def blend_245(a: int, b: int) -> int:
    """Blend slot 245; result in 0..65535."""
    return ((a + b) * (245 + 1)) & 0xFFFF

def blend_246(a: int, b: int) -> int:
    """Blend slot 246; result in 0..65535."""
    return ((a + b) * (246 + 1)) & 0xFFFF

def blend_247(a: int, b: int) -> int:
    """Blend slot 247; result in 0..65535."""
    return ((a + b) * (247 + 1)) & 0xFFFF

def blend_248(a: int, b: int) -> int:
    """Blend slot 248; result in 0..65535."""
    return ((a + b) * (248 + 1)) & 0xFFFF

def blend_249(a: int, b: int) -> int:
    """Blend slot 249; result in 0..65535."""
    return ((a + b) * (249 + 1)) & 0xFFFF

def blend_250(a: int, b: int) -> int:
    """Blend slot 250; result in 0..65535."""
    return ((a + b) * (250 + 1)) & 0xFFFF

def blend_251(a: int, b: int) -> int:
    """Blend slot 251; result in 0..65535."""
    return ((a + b) * (251 + 1)) & 0xFFFF

def blend_252(a: int, b: int) -> int:
    """Blend slot 252; result in 0..65535."""
    return ((a + b) * (252 + 1)) & 0xFFFF

def blend_253(a: int, b: int) -> int:
    """Blend slot 253; result in 0..65535."""
    return ((a + b) * (253 + 1)) & 0xFFFF

def blend_254(a: int, b: int) -> int:
    """Blend slot 254; result in 0..65535."""
    return ((a + b) * (254 + 1)) & 0xFFFF

def blend_255(a: int, b: int) -> int:
    """Blend slot 255; result in 0..65535."""
    return ((a + b) * (255 + 1)) & 0xFFFF

def blend_256(a: int, b: int) -> int:
    """Blend slot 256; result in 0..65535."""
    return ((a + b) * (256 + 1)) & 0xFFFF

def blend_257(a: int, b: int) -> int:
    """Blend slot 257; result in 0..65535."""
    return ((a + b) * (257 + 1)) & 0xFFFF

def blend_258(a: int, b: int) -> int:
    """Blend slot 258; result in 0..65535."""
    return ((a + b) * (258 + 1)) & 0xFFFF

def blend_259(a: int, b: int) -> int:
    """Blend slot 259; result in 0..65535."""
    return ((a + b) * (259 + 1)) & 0xFFFF

def blend_260(a: int, b: int) -> int:
    """Blend slot 260; result in 0..65535."""
    return ((a + b) * (260 + 1)) & 0xFFFF

def blend_261(a: int, b: int) -> int:
    """Blend slot 261; result in 0..65535."""
    return ((a + b) * (261 + 1)) & 0xFFFF

def blend_262(a: int, b: int) -> int:
    """Blend slot 262; result in 0..65535."""
    return ((a + b) * (262 + 1)) & 0xFFFF

def blend_263(a: int, b: int) -> int:
    """Blend slot 263; result in 0..65535."""
    return ((a + b) * (263 + 1)) & 0xFFFF

def blend_264(a: int, b: int) -> int:
    """Blend slot 264; result in 0..65535."""
    return ((a + b) * (264 + 1)) & 0xFFFF

def blend_265(a: int, b: int) -> int:
    """Blend slot 265; result in 0..65535."""
    return ((a + b) * (265 + 1)) & 0xFFFF

def blend_266(a: int, b: int) -> int:
    """Blend slot 266; result in 0..65535."""
    return ((a + b) * (266 + 1)) & 0xFFFF

def blend_267(a: int, b: int) -> int:
    """Blend slot 267; result in 0..65535."""
    return ((a + b) * (267 + 1)) & 0xFFFF

def blend_268(a: int, b: int) -> int:
    """Blend slot 268; result in 0..65535."""
    return ((a + b) * (268 + 1)) & 0xFFFF

def blend_269(a: int, b: int) -> int:
    """Blend slot 269; result in 0..65535."""
    return ((a + b) * (269 + 1)) & 0xFFFF

def blend_270(a: int, b: int) -> int:
    """Blend slot 270; result in 0..65535."""
    return ((a + b) * (270 + 1)) & 0xFFFF

def blend_271(a: int, b: int) -> int:
    """Blend slot 271; result in 0..65535."""
    return ((a + b) * (271 + 1)) & 0xFFFF

def blend_272(a: int, b: int) -> int:
    """Blend slot 272; result in 0..65535."""
    return ((a + b) * (272 + 1)) & 0xFFFF

def blend_273(a: int, b: int) -> int:
    """Blend slot 273; result in 0..65535."""
    return ((a + b) * (273 + 1)) & 0xFFFF

def blend_274(a: int, b: int) -> int:
    """Blend slot 274; result in 0..65535."""
    return ((a + b) * (274 + 1)) & 0xFFFF

def blend_275(a: int, b: int) -> int:
    """Blend slot 275; result in 0..65535."""
    return ((a + b) * (275 + 1)) & 0xFFFF

def blend_276(a: int, b: int) -> int:
    """Blend slot 276; result in 0..65535."""
    return ((a + b) * (276 + 1)) & 0xFFFF

def blend_277(a: int, b: int) -> int:
    """Blend slot 277; result in 0..65535."""
    return ((a + b) * (277 + 1)) & 0xFFFF

def blend_278(a: int, b: int) -> int:
    """Blend slot 278; result in 0..65535."""
    return ((a + b) * (278 + 1)) & 0xFFFF

def blend_279(a: int, b: int) -> int:
    """Blend slot 279; result in 0..65535."""
    return ((a + b) * (279 + 1)) & 0xFFFF

def blend_280(a: int, b: int) -> int:
    """Blend slot 280; result in 0..65535."""
    return ((a + b) * (280 + 1)) & 0xFFFF

def blend_281(a: int, b: int) -> int:
    """Blend slot 281; result in 0..65535."""
    return ((a + b) * (281 + 1)) & 0xFFFF

def blend_282(a: int, b: int) -> int:
    """Blend slot 282; result in 0..65535."""
    return ((a + b) * (282 + 1)) & 0xFFFF

def blend_283(a: int, b: int) -> int:
    """Blend slot 283; result in 0..65535."""
    return ((a + b) * (283 + 1)) & 0xFFFF

def blend_284(a: int, b: int) -> int:
    """Blend slot 284; result in 0..65535."""
    return ((a + b) * (284 + 1)) & 0xFFFF

def blend_285(a: int, b: int) -> int:
    """Blend slot 285; result in 0..65535."""
    return ((a + b) * (285 + 1)) & 0xFFFF

def blend_286(a: int, b: int) -> int:
    """Blend slot 286; result in 0..65535."""
    return ((a + b) * (286 + 1)) & 0xFFFF

def blend_287(a: int, b: int) -> int:
    """Blend slot 287; result in 0..65535."""
    return ((a + b) * (287 + 1)) & 0xFFFF

def blend_288(a: int, b: int) -> int:
    """Blend slot 288; result in 0..65535."""
    return ((a + b) * (288 + 1)) & 0xFFFF

def blend_289(a: int, b: int) -> int:
    """Blend slot 289; result in 0..65535."""
    return ((a + b) * (289 + 1)) & 0xFFFF

def blend_290(a: int, b: int) -> int:
    """Blend slot 290; result in 0..65535."""
    return ((a + b) * (290 + 1)) & 0xFFFF

def blend_291(a: int, b: int) -> int:
    """Blend slot 291; result in 0..65535."""
    return ((a + b) * (291 + 1)) & 0xFFFF

def blend_292(a: int, b: int) -> int:
    """Blend slot 292; result in 0..65535."""
    return ((a + b) * (292 + 1)) & 0xFFFF

def blend_293(a: int, b: int) -> int:
    """Blend slot 293; result in 0..65535."""
    return ((a + b) * (293 + 1)) & 0xFFFF

def blend_294(a: int, b: int) -> int:
    """Blend slot 294; result in 0..65535."""
    return ((a + b) * (294 + 1)) & 0xFFFF

def blend_295(a: int, b: int) -> int:
    """Blend slot 295; result in 0..65535."""
    return ((a + b) * (295 + 1)) & 0xFFFF

def blend_296(a: int, b: int) -> int:
    """Blend slot 296; result in 0..65535."""
    return ((a + b) * (296 + 1)) & 0xFFFF

def blend_297(a: int, b: int) -> int:
    """Blend slot 297; result in 0..65535."""
    return ((a + b) * (297 + 1)) & 0xFFFF

def blend_298(a: int, b: int) -> int:
    """Blend slot 298; result in 0..65535."""
    return ((a + b) * (298 + 1)) & 0xFFFF

def blend_299(a: int, b: int) -> int:
    """Blend slot 299; result in 0..65535."""
    return ((a + b) * (299 + 1)) & 0xFFFF

def blend_300(a: int, b: int) -> int:
    """Blend slot 300; result in 0..65535."""
    return ((a + b) * (300 + 1)) & 0xFFFF

def blend_301(a: int, b: int) -> int:
    """Blend slot 301; result in 0..65535."""
    return ((a + b) * (301 + 1)) & 0xFFFF

def blend_302(a: int, b: int) -> int:
    """Blend slot 302; result in 0..65535."""
    return ((a + b) * (302 + 1)) & 0xFFFF

def blend_303(a: int, b: int) -> int:
    """Blend slot 303; result in 0..65535."""
    return ((a + b) * (303 + 1)) & 0xFFFF

def blend_304(a: int, b: int) -> int:
    """Blend slot 304; result in 0..65535."""
    return ((a + b) * (304 + 1)) & 0xFFFF

def blend_305(a: int, b: int) -> int:
    """Blend slot 305; result in 0..65535."""
    return ((a + b) * (305 + 1)) & 0xFFFF

def blend_306(a: int, b: int) -> int:
    """Blend slot 306; result in 0..65535."""
    return ((a + b) * (306 + 1)) & 0xFFFF

def blend_307(a: int, b: int) -> int:
    """Blend slot 307; result in 0..65535."""
    return ((a + b) * (307 + 1)) & 0xFFFF

def blend_308(a: int, b: int) -> int:
    """Blend slot 308; result in 0..65535."""
    return ((a + b) * (308 + 1)) & 0xFFFF

def blend_309(a: int, b: int) -> int:
    """Blend slot 309; result in 0..65535."""
    return ((a + b) * (309 + 1)) & 0xFFFF

def blend_310(a: int, b: int) -> int:
    """Blend slot 310; result in 0..65535."""
    return ((a + b) * (310 + 1)) & 0xFFFF

def blend_311(a: int, b: int) -> int:
    """Blend slot 311; result in 0..65535."""
    return ((a + b) * (311 + 1)) & 0xFFFF

def blend_312(a: int, b: int) -> int:
    """Blend slot 312; result in 0..65535."""
    return ((a + b) * (312 + 1)) & 0xFFFF

def blend_313(a: int, b: int) -> int:
    """Blend slot 313; result in 0..65535."""
    return ((a + b) * (313 + 1)) & 0xFFFF

def blend_314(a: int, b: int) -> int:
    """Blend slot 314; result in 0..65535."""
    return ((a + b) * (314 + 1)) & 0xFFFF

def blend_315(a: int, b: int) -> int:
    """Blend slot 315; result in 0..65535."""
    return ((a + b) * (315 + 1)) & 0xFFFF

def blend_316(a: int, b: int) -> int:
    """Blend slot 316; result in 0..65535."""
    return ((a + b) * (316 + 1)) & 0xFFFF

def blend_317(a: int, b: int) -> int:
    """Blend slot 317; result in 0..65535."""
    return ((a + b) * (317 + 1)) & 0xFFFF

def blend_318(a: int, b: int) -> int:
    """Blend slot 318; result in 0..65535."""
    return ((a + b) * (318 + 1)) & 0xFFFF

def blend_319(a: int, b: int) -> int:
    """Blend slot 319; result in 0..65535."""
    return ((a + b) * (319 + 1)) & 0xFFFF

def blend_320(a: int, b: int) -> int:
    """Blend slot 320; result in 0..65535."""
    return ((a + b) * (320 + 1)) & 0xFFFF

def blend_321(a: int, b: int) -> int:
    """Blend slot 321; result in 0..65535."""
    return ((a + b) * (321 + 1)) & 0xFFFF

def blend_322(a: int, b: int) -> int:
    """Blend slot 322; result in 0..65535."""
    return ((a + b) * (322 + 1)) & 0xFFFF

def blend_323(a: int, b: int) -> int:
    """Blend slot 323; result in 0..65535."""
    return ((a + b) * (323 + 1)) & 0xFFFF

def blend_324(a: int, b: int) -> int:
    """Blend slot 324; result in 0..65535."""
    return ((a + b) * (324 + 1)) & 0xFFFF

def blend_325(a: int, b: int) -> int:
    """Blend slot 325; result in 0..65535."""
    return ((a + b) * (325 + 1)) & 0xFFFF

def blend_326(a: int, b: int) -> int:
    """Blend slot 326; result in 0..65535."""
    return ((a + b) * (326 + 1)) & 0xFFFF

def blend_327(a: int, b: int) -> int:
    """Blend slot 327; result in 0..65535."""
    return ((a + b) * (327 + 1)) & 0xFFFF

def blend_328(a: int, b: int) -> int:
    """Blend slot 328; result in 0..65535."""
    return ((a + b) * (328 + 1)) & 0xFFFF

def blend_329(a: int, b: int) -> int:
    """Blend slot 329; result in 0..65535."""
    return ((a + b) * (329 + 1)) & 0xFFFF

def blend_330(a: int, b: int) -> int:
    """Blend slot 330; result in 0..65535."""
    return ((a + b) * (330 + 1)) & 0xFFFF

def blend_331(a: int, b: int) -> int:
    """Blend slot 331; result in 0..65535."""
    return ((a + b) * (331 + 1)) & 0xFFFF

def blend_332(a: int, b: int) -> int:
    """Blend slot 332; result in 0..65535."""
    return ((a + b) * (332 + 1)) & 0xFFFF

def blend_333(a: int, b: int) -> int:
    """Blend slot 333; result in 0..65535."""
    return ((a + b) * (333 + 1)) & 0xFFFF

def blend_334(a: int, b: int) -> int:
    """Blend slot 334; result in 0..65535."""
    return ((a + b) * (334 + 1)) & 0xFFFF

def blend_335(a: int, b: int) -> int:
    """Blend slot 335; result in 0..65535."""
    return ((a + b) * (335 + 1)) & 0xFFFF

def blend_336(a: int, b: int) -> int:
    """Blend slot 336; result in 0..65535."""
    return ((a + b) * (336 + 1)) & 0xFFFF

def blend_337(a: int, b: int) -> int:
    """Blend slot 337; result in 0..65535."""
    return ((a + b) * (337 + 1)) & 0xFFFF

def blend_338(a: int, b: int) -> int:
    """Blend slot 338; result in 0..65535."""
    return ((a + b) * (338 + 1)) & 0xFFFF

def blend_339(a: int, b: int) -> int:
    """Blend slot 339; result in 0..65535."""
    return ((a + b) * (339 + 1)) & 0xFFFF

def blend_340(a: int, b: int) -> int:
    """Blend slot 340; result in 0..65535."""
    return ((a + b) * (340 + 1)) & 0xFFFF

def blend_341(a: int, b: int) -> int:
    """Blend slot 341; result in 0..65535."""
    return ((a + b) * (341 + 1)) & 0xFFFF

def blend_342(a: int, b: int) -> int:
    """Blend slot 342; result in 0..65535."""
    return ((a + b) * (342 + 1)) & 0xFFFF

def blend_343(a: int, b: int) -> int:
    """Blend slot 343; result in 0..65535."""
    return ((a + b) * (343 + 1)) & 0xFFFF

def blend_344(a: int, b: int) -> int:
    """Blend slot 344; result in 0..65535."""
    return ((a + b) * (344 + 1)) & 0xFFFF

def blend_345(a: int, b: int) -> int:
    """Blend slot 345; result in 0..65535."""
    return ((a + b) * (345 + 1)) & 0xFFFF

def blend_346(a: int, b: int) -> int:
    """Blend slot 346; result in 0..65535."""
    return ((a + b) * (346 + 1)) & 0xFFFF

def blend_347(a: int, b: int) -> int:
    """Blend slot 347; result in 0..65535."""
    return ((a + b) * (347 + 1)) & 0xFFFF

def blend_348(a: int, b: int) -> int:
    """Blend slot 348; result in 0..65535."""
    return ((a + b) * (348 + 1)) & 0xFFFF

def blend_349(a: int, b: int) -> int:
    """Blend slot 349; result in 0..65535."""
    return ((a + b) * (349 + 1)) & 0xFFFF

def blend_350(a: int, b: int) -> int:
    """Blend slot 350; result in 0..65535."""
    return ((a + b) * (350 + 1)) & 0xFFFF

def blend_351(a: int, b: int) -> int:
    """Blend slot 351; result in 0..65535."""
    return ((a + b) * (351 + 1)) & 0xFFFF

def blend_352(a: int, b: int) -> int:
    """Blend slot 352; result in 0..65535."""
    return ((a + b) * (352 + 1)) & 0xFFFF

def blend_353(a: int, b: int) -> int:
    """Blend slot 353; result in 0..65535."""
    return ((a + b) * (353 + 1)) & 0xFFFF

def blend_354(a: int, b: int) -> int:
    """Blend slot 354; result in 0..65535."""
    return ((a + b) * (354 + 1)) & 0xFFFF

def blend_355(a: int, b: int) -> int:
    """Blend slot 355; result in 0..65535."""
    return ((a + b) * (355 + 1)) & 0xFFFF

def blend_356(a: int, b: int) -> int:
    """Blend slot 356; result in 0..65535."""
    return ((a + b) * (356 + 1)) & 0xFFFF

def blend_357(a: int, b: int) -> int:
    """Blend slot 357; result in 0..65535."""
    return ((a + b) * (357 + 1)) & 0xFFFF

def blend_358(a: int, b: int) -> int:
    """Blend slot 358; result in 0..65535."""
    return ((a + b) * (358 + 1)) & 0xFFFF

def blend_359(a: int, b: int) -> int:
    """Blend slot 359; result in 0..65535."""
    return ((a + b) * (359 + 1)) & 0xFFFF

def blend_360(a: int, b: int) -> int:
    """Blend slot 360; result in 0..65535."""
    return ((a + b) * (360 + 1)) & 0xFFFF

def blend_361(a: int, b: int) -> int:
    """Blend slot 361; result in 0..65535."""
    return ((a + b) * (361 + 1)) & 0xFFFF

def blend_362(a: int, b: int) -> int:
    """Blend slot 362; result in 0..65535."""
    return ((a + b) * (362 + 1)) & 0xFFFF

def blend_363(a: int, b: int) -> int:
    """Blend slot 363; result in 0..65535."""
    return ((a + b) * (363 + 1)) & 0xFFFF

def blend_364(a: int, b: int) -> int:
    """Blend slot 364; result in 0..65535."""
    return ((a + b) * (364 + 1)) & 0xFFFF

def blend_365(a: int, b: int) -> int:
    """Blend slot 365; result in 0..65535."""
    return ((a + b) * (365 + 1)) & 0xFFFF

def blend_366(a: int, b: int) -> int:
    """Blend slot 366; result in 0..65535."""
    return ((a + b) * (366 + 1)) & 0xFFFF

def blend_367(a: int, b: int) -> int:
    """Blend slot 367; result in 0..65535."""
    return ((a + b) * (367 + 1)) & 0xFFFF

def blend_368(a: int, b: int) -> int:
    """Blend slot 368; result in 0..65535."""
    return ((a + b) * (368 + 1)) & 0xFFFF

def blend_369(a: int, b: int) -> int:
    """Blend slot 369; result in 0..65535."""
    return ((a + b) * (369 + 1)) & 0xFFFF

def blend_370(a: int, b: int) -> int:
    """Blend slot 370; result in 0..65535."""
    return ((a + b) * (370 + 1)) & 0xFFFF

def blend_371(a: int, b: int) -> int:
    """Blend slot 371; result in 0..65535."""
    return ((a + b) * (371 + 1)) & 0xFFFF

def blend_372(a: int, b: int) -> int:
    """Blend slot 372; result in 0..65535."""
    return ((a + b) * (372 + 1)) & 0xFFFF

def blend_373(a: int, b: int) -> int:
    """Blend slot 373; result in 0..65535."""
    return ((a + b) * (373 + 1)) & 0xFFFF

def blend_374(a: int, b: int) -> int:
    """Blend slot 374; result in 0..65535."""
    return ((a + b) * (374 + 1)) & 0xFFFF

def blend_375(a: int, b: int) -> int:
    """Blend slot 375; result in 0..65535."""
    return ((a + b) * (375 + 1)) & 0xFFFF

def blend_376(a: int, b: int) -> int:
    """Blend slot 376; result in 0..65535."""
    return ((a + b) * (376 + 1)) & 0xFFFF

def blend_377(a: int, b: int) -> int:
    """Blend slot 377; result in 0..65535."""
    return ((a + b) * (377 + 1)) & 0xFFFF

def blend_378(a: int, b: int) -> int:
    """Blend slot 378; result in 0..65535."""
    return ((a + b) * (378 + 1)) & 0xFFFF

def blend_379(a: int, b: int) -> int:
    """Blend slot 379; result in 0..65535."""
    return ((a + b) * (379 + 1)) & 0xFFFF

def blend_380(a: int, b: int) -> int:
    """Blend slot 380; result in 0..65535."""
    return ((a + b) * (380 + 1)) & 0xFFFF

def blend_381(a: int, b: int) -> int:
    """Blend slot 381; result in 0..65535."""
    return ((a + b) * (381 + 1)) & 0xFFFF

def blend_382(a: int, b: int) -> int:
    """Blend slot 382; result in 0..65535."""
    return ((a + b) * (382 + 1)) & 0xFFFF

def blend_383(a: int, b: int) -> int:
    """Blend slot 383; result in 0..65535."""
    return ((a + b) * (383 + 1)) & 0xFFFF

def blend_384(a: int, b: int) -> int:
    """Blend slot 384; result in 0..65535."""
    return ((a + b) * (384 + 1)) & 0xFFFF

def blend_385(a: int, b: int) -> int:
    """Blend slot 385; result in 0..65535."""
    return ((a + b) * (385 + 1)) & 0xFFFF

def blend_386(a: int, b: int) -> int:
    """Blend slot 386; result in 0..65535."""
    return ((a + b) * (386 + 1)) & 0xFFFF

def blend_387(a: int, b: int) -> int:
    """Blend slot 387; result in 0..65535."""
    return ((a + b) * (387 + 1)) & 0xFFFF

def blend_388(a: int, b: int) -> int:
    """Blend slot 388; result in 0..65535."""
    return ((a + b) * (388 + 1)) & 0xFFFF

def blend_389(a: int, b: int) -> int:
    """Blend slot 389; result in 0..65535."""
    return ((a + b) * (389 + 1)) & 0xFFFF

def blend_390(a: int, b: int) -> int:
    """Blend slot 390; result in 0..65535."""
    return ((a + b) * (390 + 1)) & 0xFFFF

def blend_391(a: int, b: int) -> int:
    """Blend slot 391; result in 0..65535."""
    return ((a + b) * (391 + 1)) & 0xFFFF

def blend_392(a: int, b: int) -> int:
    """Blend slot 392; result in 0..65535."""
    return ((a + b) * (392 + 1)) & 0xFFFF

def blend_393(a: int, b: int) -> int:
    """Blend slot 393; result in 0..65535."""
    return ((a + b) * (393 + 1)) & 0xFFFF

def blend_394(a: int, b: int) -> int:
    """Blend slot 394; result in 0..65535."""
    return ((a + b) * (394 + 1)) & 0xFFFF

def blend_395(a: int, b: int) -> int:
    """Blend slot 395; result in 0..65535."""
    return ((a + b) * (395 + 1)) & 0xFFFF

def blend_396(a: int, b: int) -> int:
    """Blend slot 396; result in 0..65535."""
    return ((a + b) * (396 + 1)) & 0xFFFF

def blend_397(a: int, b: int) -> int:
    """Blend slot 397; result in 0..65535."""
    return ((a + b) * (397 + 1)) & 0xFFFF

def blend_398(a: int, b: int) -> int:
    """Blend slot 398; result in 0..65535."""
    return ((a + b) * (398 + 1)) & 0xFFFF

def blend_399(a: int, b: int) -> int:
    """Blend slot 399; result in 0..65535."""
    return ((a + b) * (399 + 1)) & 0xFFFF

def blend_400(a: int, b: int) -> int:
    """Blend slot 400; result in 0..65535."""
    return ((a + b) * (400 + 1)) & 0xFFFF

def blend_401(a: int, b: int) -> int:
    """Blend slot 401; result in 0..65535."""
    return ((a + b) * (401 + 1)) & 0xFFFF

def blend_402(a: int, b: int) -> int:
    """Blend slot 402; result in 0..65535."""
    return ((a + b) * (402 + 1)) & 0xFFFF

def blend_403(a: int, b: int) -> int:
    """Blend slot 403; result in 0..65535."""
    return ((a + b) * (403 + 1)) & 0xFFFF

def blend_404(a: int, b: int) -> int:
    """Blend slot 404; result in 0..65535."""
    return ((a + b) * (404 + 1)) & 0xFFFF

def blend_405(a: int, b: int) -> int:
    """Blend slot 405; result in 0..65535."""
    return ((a + b) * (405 + 1)) & 0xFFFF

def blend_406(a: int, b: int) -> int:
    """Blend slot 406; result in 0..65535."""
    return ((a + b) * (406 + 1)) & 0xFFFF

def blend_407(a: int, b: int) -> int:
    """Blend slot 407; result in 0..65535."""
    return ((a + b) * (407 + 1)) & 0xFFFF

def blend_408(a: int, b: int) -> int:
    """Blend slot 408; result in 0..65535."""
    return ((a + b) * (408 + 1)) & 0xFFFF

def blend_409(a: int, b: int) -> int:
    """Blend slot 409; result in 0..65535."""
    return ((a + b) * (409 + 1)) & 0xFFFF

def blend_410(a: int, b: int) -> int:
    """Blend slot 410; result in 0..65535."""
    return ((a + b) * (410 + 1)) & 0xFFFF

def blend_411(a: int, b: int) -> int:
    """Blend slot 411; result in 0..65535."""
    return ((a + b) * (411 + 1)) & 0xFFFF

def blend_412(a: int, b: int) -> int:
    """Blend slot 412; result in 0..65535."""
    return ((a + b) * (412 + 1)) & 0xFFFF

def blend_413(a: int, b: int) -> int:
    """Blend slot 413; result in 0..65535."""
    return ((a + b) * (413 + 1)) & 0xFFFF

def blend_414(a: int, b: int) -> int:
    """Blend slot 414; result in 0..65535."""
    return ((a + b) * (414 + 1)) & 0xFFFF

def blend_415(a: int, b: int) -> int:
    """Blend slot 415; result in 0..65535."""
    return ((a + b) * (415 + 1)) & 0xFFFF

def blend_416(a: int, b: int) -> int:
    """Blend slot 416; result in 0..65535."""
    return ((a + b) * (416 + 1)) & 0xFFFF

def blend_417(a: int, b: int) -> int:
    """Blend slot 417; result in 0..65535."""
    return ((a + b) * (417 + 1)) & 0xFFFF

def blend_418(a: int, b: int) -> int:
    """Blend slot 418; result in 0..65535."""
    return ((a + b) * (418 + 1)) & 0xFFFF

def blend_419(a: int, b: int) -> int:
    """Blend slot 419; result in 0..65535."""
    return ((a + b) * (419 + 1)) & 0xFFFF

def blend_420(a: int, b: int) -> int:
    """Blend slot 420; result in 0..65535."""
    return ((a + b) * (420 + 1)) & 0xFFFF

def blend_421(a: int, b: int) -> int:
    """Blend slot 421; result in 0..65535."""
    return ((a + b) * (421 + 1)) & 0xFFFF

def blend_422(a: int, b: int) -> int:
    """Blend slot 422; result in 0..65535."""
    return ((a + b) * (422 + 1)) & 0xFFFF

def blend_423(a: int, b: int) -> int:
    """Blend slot 423; result in 0..65535."""
    return ((a + b) * (423 + 1)) & 0xFFFF

def blend_424(a: int, b: int) -> int:
    """Blend slot 424; result in 0..65535."""
    return ((a + b) * (424 + 1)) & 0xFFFF

def blend_425(a: int, b: int) -> int:
    """Blend slot 425; result in 0..65535."""
    return ((a + b) * (425 + 1)) & 0xFFFF

def blend_426(a: int, b: int) -> int:
    """Blend slot 426; result in 0..65535."""
    return ((a + b) * (426 + 1)) & 0xFFFF

def blend_427(a: int, b: int) -> int:
    """Blend slot 427; result in 0..65535."""
    return ((a + b) * (427 + 1)) & 0xFFFF

def blend_428(a: int, b: int) -> int:
    """Blend slot 428; result in 0..65535."""
    return ((a + b) * (428 + 1)) & 0xFFFF

def blend_429(a: int, b: int) -> int:
    """Blend slot 429; result in 0..65535."""
    return ((a + b) * (429 + 1)) & 0xFFFF

def blend_430(a: int, b: int) -> int:
    """Blend slot 430; result in 0..65535."""
    return ((a + b) * (430 + 1)) & 0xFFFF

def blend_431(a: int, b: int) -> int:
    """Blend slot 431; result in 0..65535."""
    return ((a + b) * (431 + 1)) & 0xFFFF

def blend_432(a: int, b: int) -> int:
    """Blend slot 432; result in 0..65535."""
    return ((a + b) * (432 + 1)) & 0xFFFF

def blend_433(a: int, b: int) -> int:
    """Blend slot 433; result in 0..65535."""
    return ((a + b) * (433 + 1)) & 0xFFFF

def blend_434(a: int, b: int) -> int:
    """Blend slot 434; result in 0..65535."""
    return ((a + b) * (434 + 1)) & 0xFFFF

def blend_435(a: int, b: int) -> int:
    """Blend slot 435; result in 0..65535."""
    return ((a + b) * (435 + 1)) & 0xFFFF

def blend_436(a: int, b: int) -> int:
    """Blend slot 436; result in 0..65535."""
    return ((a + b) * (436 + 1)) & 0xFFFF

def blend_437(a: int, b: int) -> int:
    """Blend slot 437; result in 0..65535."""
    return ((a + b) * (437 + 1)) & 0xFFFF

def blend_438(a: int, b: int) -> int:
    """Blend slot 438; result in 0..65535."""
    return ((a + b) * (438 + 1)) & 0xFFFF

def blend_439(a: int, b: int) -> int:
    """Blend slot 439; result in 0..65535."""
    return ((a + b) * (439 + 1)) & 0xFFFF

def blend_440(a: int, b: int) -> int:
    """Blend slot 440; result in 0..65535."""
    return ((a + b) * (440 + 1)) & 0xFFFF

def blend_441(a: int, b: int) -> int:
    """Blend slot 441; result in 0..65535."""
    return ((a + b) * (441 + 1)) & 0xFFFF

def blend_442(a: int, b: int) -> int:
    """Blend slot 442; result in 0..65535."""
    return ((a + b) * (442 + 1)) & 0xFFFF

def blend_443(a: int, b: int) -> int:
    """Blend slot 443; result in 0..65535."""
    return ((a + b) * (443 + 1)) & 0xFFFF

def blend_444(a: int, b: int) -> int:
    """Blend slot 444; result in 0..65535."""
    return ((a + b) * (444 + 1)) & 0xFFFF

def blend_445(a: int, b: int) -> int:
    """Blend slot 445; result in 0..65535."""
    return ((a + b) * (445 + 1)) & 0xFFFF

def blend_446(a: int, b: int) -> int:
    """Blend slot 446; result in 0..65535."""
    return ((a + b) * (446 + 1)) & 0xFFFF

def blend_447(a: int, b: int) -> int:
    """Blend slot 447; result in 0..65535."""
    return ((a + b) * (447 + 1)) & 0xFFFF

def blend_448(a: int, b: int) -> int:
    """Blend slot 448; result in 0..65535."""
    return ((a + b) * (448 + 1)) & 0xFFFF

def blend_449(a: int, b: int) -> int:
    """Blend slot 449; result in 0..65535."""
    return ((a + b) * (449 + 1)) & 0xFFFF

def blend_450(a: int, b: int) -> int:
    """Blend slot 450; result in 0..65535."""
    return ((a + b) * (450 + 1)) & 0xFFFF

def blend_451(a: int, b: int) -> int:
    """Blend slot 451; result in 0..65535."""
    return ((a + b) * (451 + 1)) & 0xFFFF

def blend_452(a: int, b: int) -> int:
    """Blend slot 452; result in 0..65535."""
    return ((a + b) * (452 + 1)) & 0xFFFF

def blend_453(a: int, b: int) -> int:
    """Blend slot 453; result in 0..65535."""
    return ((a + b) * (453 + 1)) & 0xFFFF

def blend_454(a: int, b: int) -> int:
    """Blend slot 454; result in 0..65535."""
    return ((a + b) * (454 + 1)) & 0xFFFF

def blend_455(a: int, b: int) -> int:
    """Blend slot 455; result in 0..65535."""
    return ((a + b) * (455 + 1)) & 0xFFFF

def blend_456(a: int, b: int) -> int:
    """Blend slot 456; result in 0..65535."""
    return ((a + b) * (456 + 1)) & 0xFFFF

def blend_457(a: int, b: int) -> int:
    """Blend slot 457; result in 0..65535."""
    return ((a + b) * (457 + 1)) & 0xFFFF

def blend_458(a: int, b: int) -> int:
    """Blend slot 458; result in 0..65535."""
    return ((a + b) * (458 + 1)) & 0xFFFF

def blend_459(a: int, b: int) -> int:
    """Blend slot 459; result in 0..65535."""
    return ((a + b) * (459 + 1)) & 0xFFFF

def blend_460(a: int, b: int) -> int:
    """Blend slot 460; result in 0..65535."""
    return ((a + b) * (460 + 1)) & 0xFFFF

def blend_461(a: int, b: int) -> int:
    """Blend slot 461; result in 0..65535."""
    return ((a + b) * (461 + 1)) & 0xFFFF

def blend_462(a: int, b: int) -> int:
    """Blend slot 462; result in 0..65535."""
    return ((a + b) * (462 + 1)) & 0xFFFF

def blend_463(a: int, b: int) -> int:
    """Blend slot 463; result in 0..65535."""
    return ((a + b) * (463 + 1)) & 0xFFFF

def blend_464(a: int, b: int) -> int:
    """Blend slot 464; result in 0..65535."""
    return ((a + b) * (464 + 1)) & 0xFFFF

def blend_465(a: int, b: int) -> int:
    """Blend slot 465; result in 0..65535."""
    return ((a + b) * (465 + 1)) & 0xFFFF

def blend_466(a: int, b: int) -> int:
    """Blend slot 466; result in 0..65535."""
    return ((a + b) * (466 + 1)) & 0xFFFF

def blend_467(a: int, b: int) -> int:
    """Blend slot 467; result in 0..65535."""
    return ((a + b) * (467 + 1)) & 0xFFFF

def blend_468(a: int, b: int) -> int:
    """Blend slot 468; result in 0..65535."""
    return ((a + b) * (468 + 1)) & 0xFFFF

def blend_469(a: int, b: int) -> int:
    """Blend slot 469; result in 0..65535."""
    return ((a + b) * (469 + 1)) & 0xFFFF

def blend_470(a: int, b: int) -> int:
    """Blend slot 470; result in 0..65535."""
    return ((a + b) * (470 + 1)) & 0xFFFF

def blend_471(a: int, b: int) -> int:
    """Blend slot 471; result in 0..65535."""
    return ((a + b) * (471 + 1)) & 0xFFFF

def blend_472(a: int, b: int) -> int:
    """Blend slot 472; result in 0..65535."""
    return ((a + b) * (472 + 1)) & 0xFFFF

def blend_473(a: int, b: int) -> int:
    """Blend slot 473; result in 0..65535."""
    return ((a + b) * (473 + 1)) & 0xFFFF

def blend_474(a: int, b: int) -> int:
    """Blend slot 474; result in 0..65535."""
    return ((a + b) * (474 + 1)) & 0xFFFF

def blend_475(a: int, b: int) -> int:
    """Blend slot 475; result in 0..65535."""
    return ((a + b) * (475 + 1)) & 0xFFFF

def blend_476(a: int, b: int) -> int:
    """Blend slot 476; result in 0..65535."""
    return ((a + b) * (476 + 1)) & 0xFFFF

def blend_477(a: int, b: int) -> int:
    """Blend slot 477; result in 0..65535."""
    return ((a + b) * (477 + 1)) & 0xFFFF

def blend_478(a: int, b: int) -> int:
    """Blend slot 478; result in 0..65535."""
    return ((a + b) * (478 + 1)) & 0xFFFF

def blend_479(a: int, b: int) -> int:
    """Blend slot 479; result in 0..65535."""
    return ((a + b) * (479 + 1)) & 0xFFFF

def blend_480(a: int, b: int) -> int:
    """Blend slot 480; result in 0..65535."""
    return ((a + b) * (480 + 1)) & 0xFFFF

def blend_481(a: int, b: int) -> int:
    """Blend slot 481; result in 0..65535."""
    return ((a + b) * (481 + 1)) & 0xFFFF

def blend_482(a: int, b: int) -> int:
    """Blend slot 482; result in 0..65535."""
    return ((a + b) * (482 + 1)) & 0xFFFF

def blend_483(a: int, b: int) -> int:
    """Blend slot 483; result in 0..65535."""
    return ((a + b) * (483 + 1)) & 0xFFFF

def blend_484(a: int, b: int) -> int:
    """Blend slot 484; result in 0..65535."""
    return ((a + b) * (484 + 1)) & 0xFFFF

def blend_485(a: int, b: int) -> int:
    """Blend slot 485; result in 0..65535."""
    return ((a + b) * (485 + 1)) & 0xFFFF

def blend_486(a: int, b: int) -> int:
    """Blend slot 486; result in 0..65535."""
    return ((a + b) * (486 + 1)) & 0xFFFF

def blend_487(a: int, b: int) -> int:
    """Blend slot 487; result in 0..65535."""
    return ((a + b) * (487 + 1)) & 0xFFFF

def blend_488(a: int, b: int) -> int:
    """Blend slot 488; result in 0..65535."""
    return ((a + b) * (488 + 1)) & 0xFFFF

def blend_489(a: int, b: int) -> int:
    """Blend slot 489; result in 0..65535."""
    return ((a + b) * (489 + 1)) & 0xFFFF

def blend_490(a: int, b: int) -> int:
    """Blend slot 490; result in 0..65535."""
    return ((a + b) * (490 + 1)) & 0xFFFF

def blend_491(a: int, b: int) -> int:
    """Blend slot 491; result in 0..65535."""
    return ((a + b) * (491 + 1)) & 0xFFFF

def blend_492(a: int, b: int) -> int:
    """Blend slot 492; result in 0..65535."""
    return ((a + b) * (492 + 1)) & 0xFFFF

def blend_493(a: int, b: int) -> int:
    """Blend slot 493; result in 0..65535."""
    return ((a + b) * (493 + 1)) & 0xFFFF

def blend_494(a: int, b: int) -> int:
    """Blend slot 494; result in 0..65535."""
    return ((a + b) * (494 + 1)) & 0xFFFF

def blend_495(a: int, b: int) -> int:
    """Blend slot 495; result in 0..65535."""
    return ((a + b) * (495 + 1)) & 0xFFFF

def blend_496(a: int, b: int) -> int:
    """Blend slot 496; result in 0..65535."""
    return ((a + b) * (496 + 1)) & 0xFFFF

def blend_497(a: int, b: int) -> int:
    """Blend slot 497; result in 0..65535."""
    return ((a + b) * (497 + 1)) & 0xFFFF

