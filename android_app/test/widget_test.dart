import 'package:flutter_test/flutter_test.dart';
import 'package:yap_mobile/main.dart';

void main() {
  testWidgets('YAP App smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const YapNativeApp());
    expect(find.byType(YapNativeApp), findsOneWidget);
  });
}
