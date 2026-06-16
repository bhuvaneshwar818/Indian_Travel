package com.indiantravelai.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class TranslationService {

    @Value("${translate.api.key:}")
    private String translateKey;

    private static final Map<String, Map<String, String>> translations = new HashMap<>();

    static {
        // Hydrate fallback dictionary for common travel terms
        Map<String, String> hindi = new HashMap<>();
        hindi.put("hello", "नमस्ते (Namaste)");
        hindi.put("thank you", "धन्यवाद (Dhanyavaad)");
        hindi.put("where is the hotel?", "होटल कहाँ है? (Hotel kahaan hai?)");
        hindi.put("how much does this cost?", "यह कितने का है? (Yeh kitne ka hai?)");
        hindi.put("where is the bathroom?", "शौचालय कहाँ है? (Shauchalay kahaan hai?)");
        hindi.put("water", "पानी (Paani)");
        translations.put("hindi", hindi);

        Map<String, String> tamil = new HashMap<>();
        tamil.put("hello", "வணக்கம் (Vanakkam)");
        tamil.put("thank you", "நன்றி (Nandri)");
        tamil.put("where is the hotel?", "ஹோட்டல் எங்கே இருக்கிறது? (Hotel engay irukkirathu?)");
        tamil.put("how much does this cost?", "இது எவ்வளவு? (Ithu evvalavu?)");
        tamil.put("where is the bathroom?", "கழிப்பறை எங்கே இருக்கிறது? (Kazhipparai engay irukkirathu?)");
        tamil.put("water", "தண்ணீர் (Thanneer)");
        translations.put("tamil", tamil);

        Map<String, String> telugu = new HashMap<>();
        telugu.put("hello", "నమస్కారం (Namaskaram)");
        telugu.put("thank you", "ధన్యవాదాలు (Dhanyavadalu)");
        telugu.put("where is the hotel?", "హోటల్ ఎక్కడ ఉంది? (Hotel ekkada undi?)");
        telugu.put("how much does this cost?", "ఇది ఎంత? (Idi entha?)");
        telugu.put("where is the bathroom?", "బాత్‌రూమ్ ఎక్కడ ఉంది? (Bathroom ekkada undi?)");
        telugu.put("water", "నీరు (Neeru)");
        translations.put("telugu", telugu);

        Map<String, String> kannada = new HashMap<>();
        kannada.put("hello", "ನಮಸ್ಕಾರ (Namaskara)");
        kannada.put("thank you", "ಧನ್ಯವಾದಗಳು (Dhanyavadagalu)");
        kannada.put("where is the hotel?", "ಹೋಟೆಲ್ ಎಲ್ಲಿದೆ? (Hotel ellide?)");
        kannada.put("how much does this cost?", "ಇದು ಎಷ್ಟು? (Idu eshtu?)");
        kannada.put("where is the bathroom?", "ಶೌಚಾಲಯ ಎಲ್ಲಿದೆ? (Shauchalaya ellide?)");
        kannada.put("water", "ನೀರು (Neeru)");
        translations.put("kannada", kannada);

        Map<String, String> malayalam = new HashMap<>();
        malayalam.put("hello", "നമസ്കാരം (Namaskaram)");
        malayalam.put("thank you", "നന്ദി (Nandi)");
        malayalam.put("where is the hotel?", "ഹോട്ടൽ എവിടെയാണ്? (Hotel evideyaanu?)");
        malayalam.put("how much does this cost?", "ഇതിന് എത്രയാകും? (Ithinu ethrayaakum?)");
        malayalam.put("where is the bathroom?", "ബാത്റൂം എവിടെയാണ്? (Bathroom evideyaanu?)");
        malayalam.put("water", "വെള്ളം (Vellam)");
        translations.put("malayalam", malayalam);
    }

    public String translate(String text, String targetLang) {
        if (text == null || text.trim().isEmpty()) {
            return "";
        }
        if (targetLang == null || targetLang.trim().isEmpty()) {
            targetLang = "Hindi";
        }

        String cleanText = text.trim().toLowerCase();
        String cleanLang = targetLang.trim().toLowerCase();

        // 1. Try local dictionary lookup
        if (translations.containsKey(cleanLang)) {
            Map<String, String> langDict = translations.get(cleanLang);
            if (langDict.containsKey(cleanText)) {
                return langDict.get(cleanText);
            }
        }

        // 2. Simulated Google Translation Fallback (Standard mock response)
        String suffix = " [" + targetLang + " translation]";
        if (cleanLang.equals("hindi")) return "अनुवाद: " + text + suffix;
        if (cleanLang.equals("tamil")) return "மொழிபெயர்ப்பு: " + text + suffix;
        if (cleanLang.equals("telugu")) return "అనువాదం: " + text + suffix;
        if (cleanLang.equals("kannada")) return "ಭಾಷಾಂತರ: " + text + suffix;
        if (cleanLang.equals("malayalam")) return "തർജ്ജമ: " + text + suffix;

        return text + " (" + targetLang + ")";
    }
}
