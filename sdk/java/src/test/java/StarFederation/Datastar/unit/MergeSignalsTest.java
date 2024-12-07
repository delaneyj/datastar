package StarFederation.Datastar.unit;

import StarFederation.Datastar.enums.EventType;
import StarFederation.Datastar.events.MergeSignals;
import StarFederation.Datastar.events.MergeSignalsOptions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;
import static StarFederation.Datastar.Consts.*;

class MergeSignalsTest {

    private MergeSignalsOptions defaultOptions;

    @BeforeEach
    void setUp() {
        defaultOptions = MergeSignalsOptions.create();
    }

    @Test
    void constructorShouldInitializeWithValidInputs() {
        String data = "signal1\nsignal2";
        MergeSignals mergeSignals = new MergeSignals(data, defaultOptions);

        assertNotNull(mergeSignals);
    }

    @Test
    void constructorShouldThrowExceptionWhenDataIsNull() {
        assertThrows(IllegalArgumentException.class, () -> {
            new MergeSignals(null, defaultOptions);
        });
    }

    @Test
    void constructorShouldThrowExceptionWhenDataIsEmpty() {
        assertThrows(IllegalArgumentException.class, () -> {
            new MergeSignals("   ", defaultOptions);
        });
    }

    @Test
    void getEventTypeShouldReturnMergeSignals() {
        String data = "signal1";
        MergeSignals mergeSignals = new MergeSignals(data, defaultOptions);

        assertEquals(EventType.MergeSignals, mergeSignals.getEventType());
    }

    @Test
    void getDataLinesShouldIncludeOnlyIfMissingWhenTrue() {
        String data = "signal1\nsignal2";
        MergeSignalsOptions options = MergeSignalsOptions.create().withOnlyIfMissing(true);

        MergeSignals mergeSignals = new MergeSignals(data, options);

        String[] expectedDataLines = new String[]{
                "data: " + ONLY_IF_MISSING_DATALINE_LITERAL + "true",
                "data: " + SIGNALS_DATALINE_LITERAL + "signal1",
                "data: " + SIGNALS_DATALINE_LITERAL + "signal2"
        };


        System.out.println(Arrays.toString(mergeSignals.getDataLines()));
        assertArrayEquals(expectedDataLines, mergeSignals.getDataLines());
    }

    @Test
    void getDataLinesShouldExcludeOnlyIfMissingWhenFalse() {
        String data = "signal1\nsignal2";
        MergeSignalsOptions options = MergeSignalsOptions.create().withOnlyIfMissing(false);

        MergeSignals mergeSignals = new MergeSignals(data, options);

        String[] expectedDataLines = new String[]{
                "data: " + SIGNALS_DATALINE_LITERAL + "signal1",
                "data: " + SIGNALS_DATALINE_LITERAL + "signal2"
        };

        System.out.println(Arrays.toString(mergeSignals.getDataLines()));
        assertArrayEquals(expectedDataLines, mergeSignals.getDataLines());
    }

    @Test
    void getDataLinesShouldHandleSingleLineData() {
        String data = "singleSignal";
        MergeSignals mergeSignals = new MergeSignals(data, defaultOptions);

        String[] expectedDataLines = new String[]{
                "data: " + SIGNALS_DATALINE_LITERAL + "singleSignal"
        };

        assertArrayEquals(expectedDataLines, mergeSignals.getDataLines());
    }
}
