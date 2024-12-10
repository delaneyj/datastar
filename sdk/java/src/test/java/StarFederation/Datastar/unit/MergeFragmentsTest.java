package StarFederation.Datastar.unit;

import StarFederation.Datastar.enums.EventType;
import StarFederation.Datastar.enums.FragmentMergeMode;
import StarFederation.Datastar.events.MergeFragments;
import StarFederation.Datastar.events.MergeFragmentsOptions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;
import static StarFederation.Datastar.Consts.*;

class MergeFragmentsTest {

    private MergeFragmentsOptions defaultOptions;

    @BeforeEach
    void setUp() {
        defaultOptions = MergeFragmentsOptions.create();
    }

    @Test
    void getDataLinesShouldIncludeAllOptions() {
        String data = "<div id=\"feed\">\n<span>1</span>\n</div>";
        MergeFragmentsOptions options = MergeFragmentsOptions.create()
                .withSelector("#feed")
                .withMergeMode(FragmentMergeMode.Append)
                .withSettleDuration(10)
                .withViewTransition(true);

        MergeFragments mergeFragments = new MergeFragments(data, options);

        String[] expectedDataLines = new String[]{
                "data: " + SELECTOR_DATALINE_LITERAL + "#feed",
                "data: " + MERGE_MODE_DATALINE_LITERAL + "append",
                "data: " + SETTLE_DURATION_DATALINE_LITERAL + "10",
                "data: " + USE_VIEW_TRANSITION_DATALINE_LITERAL + "true",
                "data: " + FRAGMENTS_DATALINE_LITERAL + "<div id=\"feed\">",
                "data: " + FRAGMENTS_DATALINE_LITERAL + "<span>1</span>",
                "data: " + FRAGMENTS_DATALINE_LITERAL + "</div>"
        };

        System.out.println(Arrays.toString(mergeFragments.getDataLines()));
        assertArrayEquals(expectedDataLines, mergeFragments.getDataLines());
    }

    @Test
    void getDataLinesShouldExcludeDefaultValues() {
        String data = "<div id=\"content\">Content</div>";
        MergeFragmentsOptions options = MergeFragmentsOptions.create()
                .withMergeMode(FragmentMergeMode.Morph) // Default value
                .withSettleDuration(300)                // Default value
                .withViewTransition(false);             // Default value

        MergeFragments mergeFragments = new MergeFragments(data, options);

        String[] expectedDataLines = new String[]{
                "data: " + FRAGMENTS_DATALINE_LITERAL + "<div id=\"content\">Content</div>"
        };

        System.out.println(Arrays.toString(mergeFragments.getDataLines()));
        assertArrayEquals(expectedDataLines, mergeFragments.getDataLines());
    }

    @Test
    void getEventTypeShouldReturnCorrectType() {
        String data = "<div>sample</div>";
        MergeFragments mergeFragments = new MergeFragments(data, defaultOptions);

        assertEquals(EventType.MergeFragments, mergeFragments.getEventType());
    }

    @Test
    void constructorShouldThrowExceptionForNullData() {
        assertThrows(IllegalArgumentException.class, () -> {
            new MergeFragments(null, defaultOptions);
        });
    }

    @Test
    void constructorShouldThrowExceptionForEmptyData() {
        assertThrows(IllegalArgumentException.class, () -> {
            new MergeFragments("   ", defaultOptions);
        });
    }
}
